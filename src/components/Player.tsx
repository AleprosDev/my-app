import React, { useRef, useEffect, useState } from "react"
import Image from "next/image"

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
  onPlayPause: () => void
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
  onPlayPause,
  onSliderChange,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [canPlay, setCanPlay] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    setCanPlay(false)
    setAudioError(null)
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [song.audio_url])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying && canPlay) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, song.audio_url, canPlay])

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      onSliderChange(Math.floor(audioRef.current.currentTime))
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = value
    }
    onSliderChange(value)
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 bg-white border-t shadow-lg px-4 py-3 flex items-center z-50">
      <Image
        src={song.cover_url}
        alt={song.title}
        width={48}
        height={48}
        className="h-12 w-12 rounded mr-4 object-cover"
        unoptimized
      />
      <div className="flex-1">
        <div className="font-semibold">{song.title}</div>
        <div className="text-sm text-gray-500">{song.artist}</div>
        <input
          type="range"
          min={0}
          max={getDurationSeconds(song.duration)}
          value={progress}
          onChange={handleSliderChange}
          className="w-full mt-2"
        />
        <div className="text-xs text-gray-400 flex justify-between">
          <span>
            {Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, "0")}
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
        />
        {!canPlay && !audioError && (
          <div className="text-blue-600 text-xs mt-2">Cargando audio completo...</div>
        )}
        {audioError && (
          <div className="text-red-600 text-xs mt-2">{audioError}</div>
        )}
      </div>
      <button
        onClick={onPlayPause}
        className="ml-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        disabled={!canPlay}
      >
        {canPlay ? (isPlaying ? "⏸️" : "▶️") : "Cargando..."}
      </button>
    </div>
  )
}

export default Player