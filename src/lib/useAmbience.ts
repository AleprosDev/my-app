import { useRef, useEffect } from "react"

export type AmbienceTrack = {
  id: string
  label: string
  url: string
  icon: string
}

export const useAmbience = (tracks: AmbienceTrack[]) => {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  // Inicializar audios
  useEffect(() => {
    tracks.forEach(track => {
      if (!audioRefs.current[track.id]) {
        const audio = new Audio(track.url)
        audio.loop = false
        audio.volume = 0 // Empiezan silenciados
        audioRefs.current[track.id] = audio
      } else if (audioRefs.current[track.id].src !== track.url) {
        // Actualizar URL si cambia
        audioRefs.current[track.id].src = track.url
      }
    })
  }, [tracks])

  const updateAmbience = (id: string, isPlaying: boolean, volume: number, loop: boolean = false) => {
    const audio = audioRefs.current[id]
    if (!audio) return

    // Ajustar volumen (0-1)
    audio.volume = Math.max(0, Math.min(1, volume / 100))
    audio.loop = loop

    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch(e => console.error("Error playing ambience:", e))
      }
    } else {
      if (!audio.paused) {
        audio.pause()
      }
    }
  }

  return { updateAmbience }
}
