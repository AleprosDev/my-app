import React, { useState, useRef, useEffect } from "react"
import { Volume2, Zap, Shield, Skull, DoorOpen, CloudRain, Wind, Flame, Music, Sliders, Play, Pause, Repeat } from "lucide-react"
import { AmbienceTrack } from "../lib/useAmbience"

export type SfxItem = {
  id: string
  label: string
  icon: string
  url: string
}

// Mapa de iconos disponibles
const ICON_MAP: Record<string, React.ElementType> = {
  sword: Shield,
  magic: Zap,
  monster: Skull,
  door: DoorOpen,
  rain: CloudRain,
  wind: Wind,
  fire: Flame,
  default: Music
}

type SoundboardProps = {
  isHost: boolean
  onPlaySfx: (sfxId: string) => void
  sounds: SfxItem[]
  ambienceTracks: AmbienceTrack[]
  onAmbienceChange: (id: string, isPlaying: boolean, volume: number, loop: boolean) => void
  ambienceState: Record<string, { isPlaying: boolean, volume: number, loop: boolean }>
}

const Soundboard: React.FC<SoundboardProps> = ({ isHost, onPlaySfx, sounds, ambienceTracks, onAmbienceChange, ambienceState }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"sfx" | "ambience">("sfx")
  const [sfxVolume, setSfxVolume] = useState(50)
  
  // Estado local eliminado, usamos props

  const handleAmbienceToggle = (track: AmbienceTrack) => {
    const current = ambienceState[track.id] || { isPlaying: false, volume: 50, loop: false }
    const newState = { ...current, isPlaying: !current.isPlaying }
    // setAmbienceState(prev => ({ ...prev, [track.id]: newState })) // Eliminado
    onAmbienceChange(track.id, newState.isPlaying, newState.volume, newState.loop)
  }

  const handleAmbienceVolume = (track: AmbienceTrack, vol: number) => {
    const current = ambienceState[track.id] || { isPlaying: false, volume: 50, loop: false }
    const newState = { ...current, volume: vol }
    // setAmbienceState(prev => ({ ...prev, [track.id]: newState })) // Eliminado
    
    // Si es host, enviamos el cambio a todos. Si no, solo local.
    if (isHost) {
      onAmbienceChange(track.id, newState.isPlaying, newState.volume, newState.loop)
    } else {
      onAmbienceChange(track.id, newState.isPlaying, newState.volume, newState.loop)
    }
  }

  const handleAmbienceLoop = (track: AmbienceTrack) => {
    const current = ambienceState[track.id] || { isPlaying: false, volume: 50, loop: false }
    const newState = { ...current, loop: !current.loop }
    // setAmbienceState(prev => ({ ...prev, [track.id]: newState })) // Eliminado
    onAmbienceChange(track.id, newState.isPlaying, newState.volume, newState.loop)
  }
  
  // Si no es host, mostramos una versión reducida o adaptada
  // if (!isHost) return null // ELIMINADO para permitir a oyentes ver el panel

  return (
    <>
      {/* Botón flotante para abrir/cerrar Soundboard */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 bottom-24 z-40 p-3 rounded-full shadow-lg transition-all duration-300 border-2 ${
          isOpen 
            ? "bg-rpg-light text-rpg-dark border-rpg-primary rotate-90" 
            : "bg-rpg-primary text-rpg-dark border-rpg-light hover:scale-110"
        }`}
        title={isHost ? "Abrir Panel DM" : "Abrir Ajustes de Sonido"}
      >
        {activeTab === "sfx" ? <Zap size={24} /> : <Sliders size={24} />}
      </button>

      {/* Panel lateral del Soundboard */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-72 bg-rpg-dark/95 border-l-2 border-rpg-accent shadow-2xl transform transition-transform duration-300 z-30 p-4 pt-20 overflow-y-auto backdrop-blur-sm ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex gap-2 mb-6 border-b border-rpg-light/20 pb-2">
          <button 
            onClick={() => setActiveTab("sfx")}
            className={`flex-1 pb-2 text-sm font-bold transition-colors ${activeTab === "sfx" ? "text-rpg-primary border-b-2 border-rpg-primary" : "text-rpg-light/50 hover:text-rpg-light"}`}
          >
            Efectos (SFX)
          </button>
          <button 
            onClick={() => setActiveTab("ambience")}
            className={`flex-1 pb-2 text-sm font-bold transition-colors ${activeTab === "ambience" ? "text-rpg-primary border-b-2 border-rpg-primary" : "text-rpg-light/50 hover:text-rpg-light"}`}
          >
            Ambiente
          </button>
        </div>

        {activeTab === "sfx" && (
          <>
            {/* Control de Volumen SFX */}
            <div className="mb-6 bg-rpg-secondary/20 p-3 rounded-lg border border-rpg-light/10">
              <div className="flex items-center gap-2 mb-2 text-rpg-light/80 text-sm">
                <Volume2 size={16} />
                <span>Volumen SFX {isHost ? "(Global)" : "(Local)"}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(Number(e.target.value))}
                className="w-full h-1 bg-rpg-secondary/50 rounded-lg appearance-none cursor-pointer accent-rpg-primary"
              />
            </div>

            {/* Grid de botones (Solo Host) */}
            {isHost ? (
              <div className="grid grid-cols-2 gap-3">
                {sounds.map((sfx) => {
                  const Icon = ICON_MAP[sfx.icon] || ICON_MAP.default
                  return (
                    <button
                      key={sfx.id}
                      onClick={() => onPlaySfx(sfx.id)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-rpg-secondary/30 border border-rpg-light/20 hover:bg-rpg-primary hover:text-rpg-dark hover:border-rpg-light transition-all active:scale-95 group"
                    >
                      <Icon size={24} className="mb-2 text-rpg-primary group-hover:text-rpg-dark transition-colors" />
                      <span className="text-xs font-medium text-rpg-light group-hover:text-rpg-dark text-center">{sfx.label}</span>
                    </button>
                  )
                })}
                {sounds.length === 0 && (
                  <div className="col-span-2 text-center text-xs text-rpg-light/50 py-4">
                    No hay efectos cargados.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-rpg-light/50 py-4 italic">
                Solo el Dungeon Master puede lanzar efectos de sonido.
              </div>
            )}
          </>
        )}

        {activeTab === "ambience" && (
          <div className="space-y-4">
            {ambienceTracks.map(track => {
              const state = ambienceState[track.id] || { isPlaying: false, volume: 50, loop: false }
              const Icon = ICON_MAP[track.icon] || ICON_MAP.default
              return (
                <div key={track.id} className="bg-rpg-secondary/20 p-3 rounded-lg border border-rpg-light/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={18} className="text-rpg-primary" />
                      <span className="text-sm font-bold text-rpg-light">{track.label}</span>
                    </div>
                    {isHost && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAmbienceLoop(track)}
                          className={`p-1 rounded-full transition-colors ${state.loop ? "text-rpg-primary" : "text-rpg-light/30 hover:text-rpg-light/70"}`}
                          title={state.loop ? "Desactivar bucle" : "Activar bucle"}
                        >
                          <Repeat size={14} />
                        </button>
                        <button
                          onClick={() => handleAmbienceToggle(track)}
                          className={`p-1 rounded-full transition-colors ${state.isPlaying ? "bg-rpg-primary text-rpg-dark" : "bg-rpg-dark text-rpg-light border border-rpg-light/20"}`}
                        >
                          {state.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                      </div>
                    )}
                    {!isHost && state.isPlaying && (
                      <div className="text-xs text-rpg-primary animate-pulse">Reproduciendo</div>
                    )}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={state.volume}
                    onChange={(e) => handleAmbienceVolume(track, Number(e.target.value))}
                    className="w-full h-1 bg-rpg-secondary/50 rounded-lg appearance-none cursor-pointer accent-rpg-primary"
                    // disabled={!state.isPlaying && !isHost} // Permitir ajustar volumen siempre
                    title={isHost ? "Volumen Global" : "Volumen Local"}
                  />
                </div>
              )
            })}
            {ambienceTracks.length === 0 && (
              <div className="text-center text-xs text-rpg-light/50 py-4">
                No hay pistas de ambiente cargadas.
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-xs text-rpg-light/40 text-center">
          Los sonidos se reproducirán para todos los usuarios conectados.
        </div>
      </div>
    </>
  )
}

// Hook helper para reproducir sonidos (usado en App.tsx)
export const useSoundEffects = (sounds: SfxItem[]) => {
  const audioPool = useRef<HTMLAudioElement[]>([])
  
  // Usar ref para tener siempre la lista actualizada sin depender del ciclo de render del closure antiguo
  const soundsRef = useRef(sounds)
  useEffect(() => {
    soundsRef.current = sounds
  }, [sounds])

  const playSfx = (sfxId: string, volume: number = 0.5) => {
    console.log("Intentando reproducir SFX:", sfxId, "Lista disponible:", soundsRef.current.map(s => s.id))
    const sfx = soundsRef.current.find(s => String(s.id) === String(sfxId))
    if (!sfx) {
      console.warn("SFX not found:", sfxId)
      return
    }

    const audio = new Audio(sfx.url)
    audio.volume = volume
    
    // Limpieza automática cuando termina
    audio.onended = () => {
      const index = audioPool.current.indexOf(audio)
      if (index > -1) {
        audioPool.current.splice(index, 1)
      }
    }

    audioPool.current.push(audio)
    audio.play().catch(e => console.error("Error playing SFX:", e))
  }

  return { playSfx }
}

export default Soundboard
