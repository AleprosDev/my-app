"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "./components/Navbar"
import Room from "./components/Room"
import Player from "./components/Player"
import { supabase } from "./lib/supabaseClient"
import { useSyncRoom, SyncEvent } from "./lib/useSyncRoom"
import type { Song } from "./types"
import SongRoutes from "./components/SongRoutes"
import Soundboard, { useSoundEffects, SfxItem } from "./components/Soundboard"
import { useAmbience, AmbienceTrack } from "./lib/useAmbience"
import "../app/globals.css"
import FeedbackForm from "./components/FeedbackForm"

const DEFAULT_ROOM = "sala1"

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [sfxList, setSfxList] = useState<SfxItem[]>([])
  const [ambienceList, setAmbienceList] = useState<AmbienceTrack[]>([])
  const [activeTab, setActiveTab] = useState("medieval")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Estado de ambiente (Lifted state)
  const [ambienceState, setAmbienceState] = useState<Record<string, { isPlaying: boolean, volume: number, loop: boolean }>>({})
  const ambienceStateRef = useRef<Record<string, { isPlaying: boolean, volume: number, loop: boolean }>>({})

  // Mantener ref sincronizado
  useEffect(() => {
    ambienceStateRef.current = ambienceState
  }, [ambienceState])
  
  const currentTimeRef = useRef(0)
  const lastSyncTimeRef = useRef(0)

  const [searchParams, setSearchParams] = useSearchParams()

  // Estado de sala y rol
  const [roomId, setRoomId] = useState(() => {
    const urlRoom = searchParams.get("room")
    if (urlRoom) return urlRoom
    const storedRoom = localStorage.getItem("music_room_id")
    return storedRoom || DEFAULT_ROOM
  })
  
  // Persistir roomId y actualizar URL
  useEffect(() => {
    localStorage.setItem("music_room_id", roomId)
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set("room", roomId)
      return newParams
    }, { replace: true })
  }, [roomId, setSearchParams])

  // Modos de conexión: 'spectator' (default, local), 'listener' (synced), 'host' (controls room)
  const [connectionMode, setConnectionMode] = useState<"spectator" | "listener" | "host">("spectator")
  
  const isHost = connectionMode === "host"
  const isListener = connectionMode === "listener"
  const isSpectator = connectionMode === "spectator"

  const [userName, setUserName] = useState(() => localStorage.getItem("room_user_name") || "")
  const [userId] = useState(() => {
    const stored = localStorage.getItem("room_user_id")
    if (stored) return stored
    const newId = `${Math.random().toString(36).slice(2)}-${Date.now()}`
    localStorage.setItem("room_user_id", newId)
    return newId
  })

  // Guardar nombre
  useEffect(() => {
    localStorage.setItem("room_user_name", userName)
  }, [userName])

  // Simulación de favoritas con persistencia local
  const [favorites, setFavorites] = useState<Song[]>(() => {
    const stored = localStorage.getItem("music_favorites")
    return stored ? JSON.parse(stored) : []
  })

  // Persistir favoritos
  useEffect(() => {
    localStorage.setItem("music_favorites", JSON.stringify(favorites))
  }, [favorites])

  // Cargar canciones desde Supabase
  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from("songs").select("*")
      console.log("Supabase data:", data, "error:", error)
      if (!error && data) {
        // Normalizar URLs si vienen relativas desde la DB o son URLs firmadas caducadas
        const formattedData = data.map((song: Song) => {
          let filename = song.audio_url || ""

          // Si es una URL de Supabase (sign o public), intentamos extraer solo el nombre del archivo
          if (filename.includes("supabase.co") && filename.includes("/music/")) {
            const parts = filename.split("/music/")
            if (parts.length > 1) {
              filename = parts[1].split("?")[0] // "Despacito.mp3"
            }
          }

          // Si después de limpiar sigue siendo una URL completa (ej: externa), la dejamos
          if (filename.startsWith("http")) {
            return { ...song, audio_url: filename }
          }

          // Construimos la URL pública
          return {
            ...song,
            audio_url: filename
              ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/music/${filename.replace(/^\//, "")}`
              : "",
          }
        })
        setSongs(formattedData)
      }
    }
    fetchSongs()
  }, [])

  // Cargar SFX desde Supabase
  useEffect(() => {
    const fetchSfx = async () => {
      console.log("Iniciando carga de SFX...")
      const { data, error } = await supabase.from("sfx").select("*")
      console.log("Respuesta Supabase SFX:", data, error)
      
      if (error) {
        console.error("Error al cargar SFX:", error.message)
      }
      
      if (!error && data) {
        const formattedSfx = data.map((item) => ({
          id: String(item.id),
          label: item.label,
          icon: item.icon,
          url: item.url.startsWith("http") 
            ? item.url 
            : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/music/${item.url.replace(/^\//, "")}`
        }))
        setSfxList(formattedSfx)
      }
    }
    fetchSfx()
  }, [])

  // Cargar Ambientes desde Supabase
  useEffect(() => {
    const fetchAmbience = async () => {
      const { data, error } = await supabase.from("ambience").select("*")
      if (!error && data) {
        const formatted = data.map((item) => ({
          id: String(item.id),
          label: item.label,
          icon: item.icon,
          url: item.url.startsWith("http") 
            ? item.url 
            : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/music/${item.url.replace(/^\//, "")}`
        }))
        setAmbienceList(formatted)
      }
    }
    fetchAmbience()
  }, [])

  const { playSfx } = useSoundEffects(sfxList)
  const { updateAmbience } = useAmbience(ambienceList)

  // Handler para SongItem con lógica de favoritos
  const handleSongClick = (song: Song) => {
    setSelectedSong(song)
    setIsPlaying(true)
    setProgress(0)
    // Emitir evento de cambio de canción a la sala SOLO si es host
    if (isHost) {
      sendSyncEvent({
        action: "change_song",
        songId: String(song.id),
        currentTime: 0,
        timestamp: Date.now(),
      })
    }
  }

  // Favoritos: agregar/quitar
  const toggleFavorite = useCallback((song: Song) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.id === song.id)
      if (exists) {
        return prev.filter(fav => fav.id !== song.id)
      } else {
        return [...prev, song]
      }
    })
  }, [])

  // Sincronización con Supabase
  const onSyncEvent = useCallback((event: SyncEvent) => {
    if (isSpectator) return // Espectadores no reaccionan a eventos de sincronización

    if (event.action === "play_sfx" && event.sfxId) {
      playSfx(event.sfxId)
    } else if (event.action === "ambience_update" && event.ambienceId) {
      // Usar ref para obtener estado actual sin re-renderizar el callback
      const currentLocal = ambienceStateRef.current[event.ambienceId]
      // Mantener volumen local si existe, sino usar el del evento (inicial)
      const newVolume = currentLocal ? currentLocal.volume : (event.volume || 50)
      
      setAmbienceState(prev => ({
        ...prev,
        [event.ambienceId!]: {
          isPlaying: event.isPlaying || false,
          volume: newVolume,
          loop: event.loop || false
        }
      }))
      
      updateAmbience(event.ambienceId, event.isPlaying || false, newVolume, event.loop || false)
    } else if (event.action === "play") {
      const song = songs.find(s => String(s.id) === event.songId)
      if (song) setSelectedSong(song)
      setIsPlaying(true)
      setProgress(event.currentTime)
      currentTimeRef.current = event.currentTime
    } else if (event.action === "pause") {
      setIsPlaying(false)
      setProgress(event.currentTime)
      currentTimeRef.current = event.currentTime
    } else if (event.action === "seek") {
      setProgress(event.currentTime)
      currentTimeRef.current = event.currentTime
    } else if (event.action === "change_song") {
      const song = songs.find(s => String(s.id) === event.songId)
      if (song) setSelectedSong(song)
      setProgress(0)
      currentTimeRef.current = 0
    } else if (event.action === "time_update") {
      // Solo corregir si hay desvío > 2s
      if (Math.abs(currentTimeRef.current - event.currentTime) > 2) {
        console.log("Sincronizando tiempo...", currentTimeRef.current, event.currentTime)
        setProgress(event.currentTime)
        currentTimeRef.current = event.currentTime
      }
    }
  }, [songs, playSfx, updateAmbience, isSpectator])

  const { sendSyncEvent, users } = useSyncRoom({ 
    roomId, 
    userId,
    name: userName,
    role: connectionMode,
    onEvent: onSyncEvent,
    hostState: isHost && selectedSong ? {
      songId: String(selectedSong.id),
      isPlaying,
      progress: currentTimeRef.current
    } : undefined
  })

  // Sincronización inicial al entrar (si soy oyente y hay un host activo)
  useEffect(() => {
    if (isHost) return
    
    const host = users.find(u => u.role === "host" && u.hostState)
    if (host && host.hostState) {
      // Solo sincronizar si no estamos reproduciendo nada o si la canción es diferente
      // O si acabamos de montar el componente (podríamos usar un ref para trackear "initialSyncDone")
      const { songId, isPlaying: hostPlaying, progress: hostProgress, timestamp } = host.hostState
      
      // Calcular tiempo actual estimado
      const now = Date.now()
      const timeDiff = (now - timestamp) / 1000
      const estimatedTime = hostPlaying ? hostProgress + timeDiff : hostProgress

      // Si no tengo canción seleccionada, o es distinta, forzar cambio
      if (!selectedSong || String(selectedSong.id) !== songId) {
        const song = songs.find(s => String(s.id) === songId)
        if (song) {
          console.log("Sincronización inicial con Host:", song.title, estimatedTime)
          setSelectedSong(song)
          setProgress(estimatedTime)
          currentTimeRef.current = estimatedTime
          setIsPlaying(hostPlaying)
        }
      }
    }
  }, [users, isHost, songs, selectedSong]) // Dependencias: cuando cambian los usuarios (entra host) o las canciones cargan

  const handleTimeUpdate = (currentTime: number) => {
    currentTimeRef.current = currentTime
    
    if (isHost && selectedSong && isPlaying) {
      const now = Date.now()
      // Enviar actualización cada 2 segundos
      if (now - lastSyncTimeRef.current > 2000) {
        sendSyncEvent({
          action: "time_update",
          songId: String(selectedSong.id),
          currentTime: currentTime,
          timestamp: now,
        })
        lastSyncTimeRef.current = now
      }
    }
  }

  // Handlers para el host y espectadores
  const handlePlay = () => {
    if (isListener) return // Listeners están sincronizados
    setIsPlaying(true)
    if (isHost && selectedSong) {
      sendSyncEvent({
        action: "play",
        songId: String(selectedSong.id),
        currentTime: currentTimeRef.current,
        timestamp: Date.now(),
      })
    }
  }
  const handlePause = () => {
    if (isListener) return // Listeners están sincronizados
    setIsPlaying(false)
    if (isHost && selectedSong) {
      sendSyncEvent({
        action: "pause",
        songId: String(selectedSong.id),
        currentTime: currentTimeRef.current,
        timestamp: Date.now(),
      })
    }
  }
  const handleSliderChange = (value: number) => {
    if (isListener) return // Listeners no pueden hacer seek
    setProgress(value)
    currentTimeRef.current = value
    if (isHost && selectedSong) {
      sendSyncEvent({
        action: "seek",
        songId: String(selectedSong.id),
        currentTime: value,
        timestamp: Date.now(),
      })
    }
  }

  // Handler para SFX (Host y Spectator)
  const handlePlaySfx = (sfxId: string) => {
    if (isListener) return // Listeners no lanzan SFX
    // Reproducir localmente
    playSfx(sfxId)
    // Enviar evento a la sala solo si es Host
    if (isHost) {
      sendSyncEvent({
        action: "play_sfx",
        songId: "sfx", // Dummy ID
        currentTime: 0,
        timestamp: Date.now(),
        sfxId: sfxId
      })
    }
  }

  // Handler para Ambientes (Host y Local)
  const handleAmbienceChange = (id: string, isPlaying: boolean, volume: number, loop: boolean) => {
    // Actualizar estado local (UI)
    setAmbienceState(prev => ({
      ...prev,
      [id]: { isPlaying, volume, loop }
    }))

    // Siempre actualizar audio localmente
    updateAmbience(id, isPlaying, volume, loop)
    
    // Si soy Host, enviar evento a la sala
    if (isHost) {
      sendSyncEvent({
        action: "ambience_update",
        songId: "ambience", // Dummy ID
        currentTime: 0,
        timestamp: Date.now(),
        ambienceId: id,
        isPlaying,
        volume,
        loop
      })
    }
  }

  // Persistir estado del Host para recuperación tras refresh
  useEffect(() => {
    if (isHost && selectedSong) {
      const state = {
        songId: selectedSong.id,
        isPlaying,
        progress: currentTimeRef.current,
        timestamp: Date.now()
      }
      localStorage.setItem("host_state", JSON.stringify(state))
    }
  }, [isHost, selectedSong, isPlaying, progress])

  // Recuperar estado del Host al montar si soy Host
  useEffect(() => {
    if (isHost && !selectedSong) {
      const stored = localStorage.getItem("host_state")
      if (stored) {
        try {
          const state = JSON.parse(stored)
          // Solo recuperar si es reciente (ej. menos de 1 hora)
          if (Date.now() - state.timestamp < 3600000) {
            const song = songs.find(s => s.id === state.songId)
            if (song) {
              console.log("Recuperando sesión de Host:", song.title)
              setSelectedSong(song)
              setProgress(state.progress)
              currentTimeRef.current = state.progress
              setIsPlaying(false) // Recuperar en pausa por seguridad/autoplay policies
            }
          }
        } catch (e) {
          console.error("Error recuperando estado de host", e)
        }
      }
    }
  }, [isHost, selectedSong, songs])

  const navigate = useNavigate();

  // Handler para navegar a la ruta de género
  const handleGenreClick = (genre: string) => {
    setActiveTab(genre)
    navigate(`/category/${genre}`);
  };

  // Handler para navegar a favoritos
  const handleFavoritesClick = () => {
    navigate("/favoritos");
  };

  return (
    <div className="min-h-screen bg-rpg-dark pb-24">
      <Navbar activeTab={activeTab} setActiveTab={handleGenreClick} />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-rpg-light">Mi Biblioteca Musical</h1>
        {/* Botones de acción */}
        <div className="flex gap-2 mb-6">
          {/* Botón de favoritos */}
          <button
            className="px-3 py-1 rounded bg-rpg-light text-black hover:bg-rpg-accent hover:text-rpg-dark transition font-bold border border-rpg-light/20"
            onClick={handleFavoritesClick}
          >
            ★ Favoritos
          </button>
        </div>
        {/* Rutas principales de canciones */}
        <SongRoutes 
          songs={songs} 
          favorites={favorites} 
          toggleFavorite={toggleFavorite} 
          onSongClick={handleSongClick}
          currentSong={selectedSong}
          isPlaying={isPlaying}
        />
      </main>

      <Room
        roomId={roomId}
        setRoomId={setRoomId}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        connectionMode={connectionMode}
        setConnectionMode={setConnectionMode}
        users={users}
        userName={userName}
        setUserName={setUserName}
      />
      
      <Soundboard 
        isHost={isHost} 
        onPlaySfx={handlePlaySfx} 
        sounds={sfxList}
        ambienceTracks={ambienceList}
        onAmbienceChange={handleAmbienceChange}
        ambienceState={ambienceState}
      />

      <FeedbackForm />

      <Player
        song={selectedSong ? {
          ...selectedSong,
          cover_url: selectedSong.cover_url || "",
          audio_url: selectedSong.audio_url || ""
        } : {
          title: "",
          artist: "",
          duration: "00:00",
          cover_url: "",
          audio_url: ""
        }}
        isPlaying={isPlaying}
        progress={progress}
        onSliderChange={handleSliderChange}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        isHost={isHost || isSpectator} // Permitir control si es host O espectador
      />

    </div>
  )
}

export default App
