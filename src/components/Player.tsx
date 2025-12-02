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
  // El volumen del audio debe ser SIEMPRE igual al del slider después de cualquier fade, cambio de canción o play/pause.
  // El fadeIn y fadeOut usan el valor del slider como destino/final.

  // Fade in
  const fadeIn = (targetVol: number, done?: () => void) => {
    if (!audioRef.current) return
    let t = 0
    const duration = 1000 // ms
    audioRef.current.volume = 0
    function step() {
      if (!audioRef.current) return
      t += 40
      const v = targetVol * (1 - Math.exp(-3 * t / duration))
      audioRef.current.volume = Math.min(targetVol, v)
      if (t < duration && v < targetVol - 0.01) {
        setTimeout(step, 40)
      } else {
        audioRef.current.volume = targetVol
        if (done) done()
      }
    }
    step()
  }

  // Fade out
  const fadeOut = (done?: () => void) => {
    if (!audioRef.current) return
    let t = 0
    const duration = 1000 // ms
    const startVol = audioRef.current.volume
    function step() {
      if (!audioRef.current) return
      t += 40
      const v = startVol * Math.exp(-3 * t / duration)
      audioRef.current.volume = Math.max(0, v)
      if (t < duration && v > 0.01) {
        setTimeout(step, 40)
      } else {
        audioRef.current.volume = 0
        if (done) done()
      }
    }
    step()
  }

  const [needsInteraction, setNeedsInteraction] = useState(false)

  // Controlar play/pause con fades
  useEffect(() => {
    if (!audioRef.current || !canPlay) return
    if (isPlaying) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setNeedsInteraction(false)
            fadeIn(volume / 100)
          })
          .catch((error) => {
            console.error("Error al reproducir:", error)
            // Si el error es NotAllowedError, necesitamos interacción del usuario
            if (error.name === "NotAllowedError") {
              setNeedsInteraction(true)
            }
          })
      }
    } else {
      fadeOut(() => {
        if (audioRef.current) {
          audioRef.current.pause()
          // Restaurar el volumen al slider tras pausar
          audioRef.current.volume = volume / 100
        }
      })
    }
    // eslint-disable-next-line
  }, [isPlaying, canPlay])

  // Al cambiar de canción, setear el volumen al slider tras cargar
  useEffect(() => {
    if (!audioRef.current) return
    const audioEl = audioRef.current
    const handler = () => {
      audioEl.volume = volume / 100
    }
    audioEl.addEventListener('canplaythrough', handler)
    return () => {
      audioEl.removeEventListener('canplaythrough', handler)
    }
  }, [song.audio_url, volume])

  // Cuando cambia el volumen desde el slider, actualizar el volumen del audio inmediatamente (si no está en fade)
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = volume / 100
    }
  }, [volume, isPlaying])

  // Solo renderizar si song tiene todos los campos requeridos
  if (!song || !song.title || !song.artist || !song.duration || !song.cover_url || !song.audio_url) {
    return <div className="text-center text-rpg-light/50 py-8">Selecciona una canción para comenzar</div>;
  }

  const durationSecs = getDurationSeconds(song.duration) || 1;
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
          src={song.cover_url}
          alt={song.title}
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
            <span className="font-bold text-white text-lg">{song.title}</span>
            <span className="text-sm text-rpg-light/70 ml-2">{song.artist}</span>
          </div>
          <div className="text-xs text-rpg-light/60 font-mono">
            {Math.floor(localProgress / 60)}:{(localProgress % 60).toString().padStart(2, "0")} / {song.duration}
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
          src={song.audio_url}
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