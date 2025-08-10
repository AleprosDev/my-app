import React, { useRef, useEffect, useState } from "react"
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
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [canPlay, setCanPlay] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [localProgress, setLocalProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [volume, setVolume] = useState(80) // Volumen local, 80% por defecto

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
      setLocalProgress(Math.floor(audioRef.current.currentTime))
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

  // Controlar play/pause con fades
  useEffect(() => {
    if (!audioRef.current || !canPlay) return
    if (isPlaying) {
      audioRef.current.play().then(() => {
        fadeIn(volume / 100)
      }).catch(() => {})
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
    return <div className="text-center text-gray-500 py-8">Selecciona una canción para comenzar</div>;
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 bg-white border-t shadow-lg px-4 py-3 flex items-center z-50">      <img
        src={song.cover_url}
        alt={song.title}
        width={48}
        height={48}
        className="h-12 w-12 rounded mr-4 object-cover"
      />
      <div className="flex-1">
        <div className="font-semibold">{song.title}</div>
        <div className="text-sm text-gray-500">{song.artist}</div>
        <input
          type="range"
          min={0}
          max={getDurationSeconds(song.duration)}
          value={localProgress}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="w-full mt-2"
        />
        <div className="text-xs text-gray-400 flex justify-between">
          <span>
            {Math.floor(localProgress / 60)}:{(localProgress % 60).toString().padStart(2, "0")}
          </span>
          <span>{song.duration}</span>
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
        <div className="flex items-center mt-2">
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-24 mr-2 align-middle"
            aria-label="Volumen"
          />
          <span className="text-xs text-gray-500">{volume}%</span>
        </div>
        {!canPlay && !audioError && (
          <div className="text-blue-600 text-xs mt-2">Cargando audio completo...</div>
        )}
        {audioError && (
          <div className="text-red-600 text-xs mt-2">{audioError}</div>
        )}
      </div>
    </div>
  )
}

export default Player