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

    const targetVolume = Math.max(0, Math.min(1, volume / 100))
    audio.loop = loop

    if (isPlaying) {
      if (audio.paused) {
        audio.volume = 0
        audio.play().catch(e => console.error("Error playing ambience:", e))
        // Fade In
        fadeIn(audio, targetVolume)
      } else {
        // Si ya está sonando, solo ajustar volumen (con fade suave si cambia mucho?)
        // Por ahora ajuste directo o suave
        audio.volume = targetVolume
      }
    } else {
      if (!audio.paused) {
        // Fade Out y luego pause
        fadeOut(audio, () => audio.pause())
      }
    }
  }

  const fadeIn = (audio: HTMLAudioElement, targetVol: number) => {
    let vol = 0
    audio.volume = vol
    const interval = setInterval(() => {
      if (vol < targetVol) {
        vol += 0.05
        if (vol > targetVol) vol = targetVol
        audio.volume = vol
      } else {
        clearInterval(interval)
      }
    }, 100)
  }

  const fadeOut = (audio: HTMLAudioElement, onComplete: () => void) => {
    let vol = audio.volume
    const interval = setInterval(() => {
      if (vol > 0) {
        vol -= 0.05
        if (vol < 0) vol = 0
        audio.volume = vol
      } else {
        clearInterval(interval)
        onComplete()
      }
    }, 100)
  }

  return { updateAmbience }
}
