import React, { useRef, useEffect, useState } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

type PlayerProps = {
  song: {
    title: string
    artist: string
    duration: string
    cover_url: string
    audio_url: string
  }
  isPlaying: boolean
  progress: number
  onSliderChange: (value: number) => void
  onTimeUpdate?: (currentTime: number) => void
  onPlay?: () => void
  onPause?: () => void
  isHost?: boolean
}

const getDurationSeconds = (duration: string) => {
  const [min, sec] = duration.split(":").map(Number)
  return min * 60 + sec
}

const Player: React.FC<PlayerProps> = ({
  song,
  isPlaying,
  progress,
  onSliderChange,
  onTimeUpdate,
  onPlay,
  onPause,
  isHost = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [canPlay, setCanPlay] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [localProgress, setLocalProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem("music_volume")
    return stored ? Number(stored) : 80
  }) // Volumen local, 80% por defecto

  // Persistir volumen
  useEffect(() => {
    localStorage.setItem("music_volume", String(volume))
  }, [volume])

  useEffect(() => {
    setCanPlay(false)
    setAudioError(null)
    setLocalProgress(0)
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [song.audio_url])

  // Solo hacer seek cuando cambia la canción o el host hace seek
  useEffect(() => {
    if (!audioRef.current) return
    if (!isSeeking) {
      audioRef.current.currentTime = progress
      setLocalProgress(progress)
    }
  }, [progress, song.audio_url, isSeeking])

  // Actualizar el slider local solo con el avance natural del audio
  const handleAudioTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      const currentTime = audioRef.current.currentTime
      setLocalProgress(Math.floor(currentTime))
      if (onTimeUpdate) {
        onTimeUpdate(currentTime)
      }
    }
  }

  const handleCanPlayThrough = () => {
    setCanPlay(true)
  }

  const handleLoadStart = () => {
    setCanPlay(false)
  }

  const handleAudioError = () => {
    const audio = audioRef.current
    let msg = "Error al reproducir el audio."
    if (audio && audio.error) {
      switch (audio.error.code) {
        case audio.error.MEDIA_ERR_ABORTED:
          msg = "La reproducción fue abortada."
          break
        case audio.error.MEDIA_ERR_NETWORK:
          msg = "Error de red al descargar el audio."
          break
        case audio.error.MEDIA_ERR_DECODE:
          msg = "Error al decodificar el archivo de audio."
          break
        case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          msg = "Formato de audio no soportado o archivo no encontrado."
          break
      }
    }
    setAudioError(msg)
    console.error("Audio error:", msg, song.audio_url)
  }

  // Solo notificar a App cuando el usuario mueve el slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setIsSeeking(true)
    setLocalProgress(value)
  }
  const handleSliderCommit = (e: React.MouseEvent | React.TouchEvent) => {
    setIsSeeking(false)
    if (audioRef.current) {
      audioRef.current.currentTime = localProgress
    }
    onSliderChange(localProgress)
  }

  // Actualizar volumen del audio cuando cambia el slider
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // --- NUEVA LÓGICA DE VOLUMEN Y FADES ROBUSTA ---
  // Estado interno para manejar la canción actual y permitir transiciones
  const [internalSong, setInternalSong] = useState(song)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Ref para controlar los timeouts de los fades y poder cancelarlos
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const stopFades = () => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
      fadeTimeoutRef.current = null
    }
  }

  // Fade in
  const fadeIn = (targetVol: number, done?: () => void) => {
    stopFades()
    if (!audioRef.current) return
    let t = 0
    const duration = 1500 // 1.5s para transición suave
    audioRef.current.volume = 0
    
    function step() {
      if (!audioRef.current) return
      t += 50
      // Curva exponencial suave
      const v = targetVol * (1 - Math.exp(-3 * t / duration))
      audioRef.current.volume = Math.min(targetVol, Math.max(0, v))
      
      if (t < duration && v < targetVol - 0.01) {
        fadeTimeoutRef.current = setTimeout(step, 50)
      } else {
        audioRef.current.volume = targetVol
        fadeTimeoutRef.current = null
        if (done) done()
      }
    }
    step()
  }

  // Fade out
  const fadeOut = (done?: () => void) => {
    stopFades()
    if (!audioRef.current) {
      if (done) done()
      return
    }
    
    let t = 0
    const duration = 1000 // 1s para fade out
    const startVol = audioRef.current.volume
    
    if (startVol <= 0.01) {
      if (done) done()
      return
    }

    function step() {
      if (!audioRef.current) return
      t += 50
      const v = startVol * Math.exp(-3 * t / duration)
      audioRef.current.volume = Math.max(0, v)
      
      if (t < duration && v > 0.01) {
        fadeTimeoutRef.current = setTimeout(step, 50)
      } else {
        audioRef.current.volume = 0
        fadeTimeoutRef.current = null
        if (done) done()
      }
    }
    step()
  }

  // Efecto para manejar el cambio de canción con transición (Crossfade simulado)
  useEffect(() => {
    // Si la URL es la misma, no hacemos nada (evita loops)
    if (song.audio_url === internalSong.audio_url) return

    const audio = audioRef.current
    
    // Si no hay audio o está pausado, cambio directo sin fade out
    if (!audio || audio.paused || !isPlaying) {
      setInternalSong(song)
      return
    }

    // Si está reproduciendo, hacemos fade out primero
    setIsTransitioning(true)
    fadeOut(() => {
      setInternalSong(song)
      setIsTransitioning(false)
      // El efecto de abajo (canPlay) se encargará del fade in
    })
  }, [song, isPlaying, internalSong.audio_url]) // Dependemos de song (prop) y estado de reproducción

  const [needsInteraction, setNeedsInteraction] = useState(false)

  // Controlar play/pause y Fade In al cargar nueva canción
  useEffect(() => {
    if (!audioRef.current) return
    
    // Si estamos en medio de una transición de canción, no interferir
    if (isTransitioning) return

    if (isPlaying && canPlay) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setNeedsInteraction(false)
            // Hacemos fade in hasta el volumen deseado
            fadeIn(volume / 100)
          })
          .catch((error) => {
            console.error("Error al reproducir:", error)
            if (error.name === "NotAllowedError") {
              setNeedsInteraction(true)
            }
          })
      }
    } else if (!isPlaying && !isTransitioning) {
      // Solo pausar si NO estamos transicionando (la transición maneja su propio fade out)
      // Y si realmente estaba sonando
      if (!audioRef.current.paused) {
        fadeOut(() => {
          if (audioRef.current) {
            audioRef.current.pause()
            // Restaurar volumen para que al volver a dar play (sin cambio de canción) funcione la lógica normal
            // Aunque nuestra lógica de play siempre hace fade in, así que está bien.
          }
        })
      }
    }
  }, [isPlaying, canPlay, internalSong, isTransitioning, volume]) // Agregamos internalSong para disparar al terminar el cambio

  // Cargar audio cuando cambia internalSong
  useEffect(() => {
    setCanPlay(false)
    setAudioError(null)
    setLocalProgress(0)
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [internalSong.audio_url])

  // Actualizar volumen del audio cuando cambia el slider (solo si no estamos en transición)
  useEffect(() => {
    if (audioRef.current && isPlaying && !isTransitioning) {
      // Si el usuario mueve el slider manualmente, cancelamos cualquier fade en progreso
      stopFades()
      audioRef.current.volume = volume / 100
    }
  }, [volume, isPlaying, isTransitioning])

  // Solo renderizar si song tiene todos los campos requeridos
  // Usamos internalSong para mostrar la info de lo que realmente suena (o va a sonar)
  const displaySong = internalSong

  if (!displaySong || !displaySong.title || !displaySong.artist || !displaySong.duration || !displaySong.cover_url || !displaySong.audio_url) {
    return <div className="text-center text-rpg-light/50 py-8">Selecciona una canción para comenzar</div>;
  }

  const durationSecs = getDurationSeconds(displaySong.duration) || 1;
  const progressPercent = (localProgress / durationSecs) * 100;

  return (
    <div className="fixed left-0 right-0 bottom-0 bg-rpg-dark/95 backdrop-blur-md border-t border-rpg-accent/30 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-4 py-3 flex items-center z-50 gap-4">
      {/* Visualizer Background (Simulated) */}
      {isPlaying && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
           <div className="flex items-end justify-center h-full gap-1 pb-0 w-full">
             {[...Array(40)].map((_, i) => (
               <div 
                key={i} 
                className="flex-1 bg-rpg-accent animate-pulse" 
                style={{ 
                  height: `${20 + Math.random() * 80}%`, 
                  animationDuration: `${0.5 + Math.random()}s`,
                  opacity: Math.random() 
                }} 
               />
             ))}
           </div>
        </div>
      )}

      {/* Album Art */}
      <div className="relative group flex-shrink-0">
        <img
          src={displaySong.cover_url}
          alt={displaySong.title}
          className="h-16 w-16 rounded-lg object-cover border border-rpg-light/20 shadow-lg"
        />
        {/* Mini visualizer overlay on album art */}
        {isPlaying && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg backdrop-blur-[1px]">
             <div className="flex gap-1 items-end h-6">
               <div className="w-1 bg-rpg-accent animate-[bounce_1s_infinite] h-3"></div>
               <div className="w-1 bg-rpg-accent animate-[bounce_1.2s_infinite] h-5"></div>
               <div className="w-1 bg-rpg-accent animate-[bounce_0.8s_infinite] h-4"></div>
             </div>
           </div>
        )}
      </div>
      
      {/* Play/Pause Button (Host Only) */}
      {isHost && (
        <button
          onClick={isPlaying ? onPause : onPlay}
          className={`
            p-3 rounded-full bg-rpg-accent text-rpg-dark hover:bg-white transition-all shadow-[0_0_15px_rgba(212,255,95,0.5)] flex-shrink-0 border-2 border-white/20 z-20
            ${isPlaying ? 'animate-pulse-slow' : ''}
          `}
          title={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-0" />}
        </button>
      )}

      <div className="flex-1 min-w-0 relative z-10">
        {/* Now Playing Label */}
        <div className="text-xs text-rpg-accent font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rpg-accent animate-pulse shadow-[0_0_5px_#d4ff5f]"></span>
          Now Playing
        </div>

        <div className="flex justify-between items-baseline mb-1">
          <div className="truncate pr-2">
            <span className="font-bold text-white text-lg">{displaySong.title}</span>
            <span className="text-sm text-rpg-light/70 ml-2">{displaySong.artist}</span>
          </div>
          <div className="text-xs text-rpg-light/60 font-mono">
            {Math.floor(localProgress / 60)}:{(localProgress % 60).toString().padStart(2, "0")} / {displaySong.duration}
          </div>
        </div>
        
        {/* Progress Bar with Glow */}
        <div className="relative group/slider h-2 flex items-center">
          <div className="absolute -inset-y-2 -inset-x-0 bg-rpg-accent/20 blur-md rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity"></div>
          <input
            type="range"
            min={0}
            max={durationSecs}
            value={localProgress}
            onChange={handleSliderChange}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="relative w-full h-1.5 bg-rpg-secondary/50 rounded-lg appearance-none cursor-pointer accent-rpg-accent hover:accent-white transition-all"
            disabled={!isHost}
            style={{
              background: `linear-gradient(to right, var(--color-rpg-accent) ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)`
            }}
          />
        </div>
        
        <audio
          ref={audioRef}
          src={displaySong.audio_url}
          onTimeUpdate={handleAudioTimeUpdate}
          preload="auto"
          onCanPlayThrough={handleCanPlayThrough}
          onLoadStart={handleLoadStart}
          onError={handleAudioError}
          loop
        />
        
        <div className="flex items-center mt-2 gap-3">
          <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-full border border-white/5">
            {volume === 0 ? <VolumeX size={14} className="text-rpg-light/50" /> : <Volume2 size={14} className="text-rpg-light/70" />}
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-20 h-1 bg-rpg-secondary/30 rounded-lg appearance-none cursor-pointer accent-rpg-light"
              aria-label="Volumen"
            />
          </div>
          
          {!canPlay && !audioError && (
            <span className="text-rpg-primary text-xs ml-2 animate-pulse font-bold">Cargando...</span>
          )}
          {needsInteraction && (
            <button 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.play()
                    .then(() => setNeedsInteraction(false))
                    .catch(console.error)
                }
              }}
              className="ml-2 bg-rpg-accent text-white text-xs px-2 py-1 rounded animate-pulse hover:bg-rpg-light hover:text-rpg-dark font-bold"
            >
              ¡Click para activar sonido!
            </button>
          )}
          {audioError && (
            <span className="text-red-400 text-xs ml-2 truncate" title={audioError}>
              Error: {audioError}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Player