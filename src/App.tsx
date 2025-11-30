"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
import SongList from "./components/SongList"
import SearchBar from "./components/SearchBar"
import Room from "./components/Room"
import Player from "./components/Player"
import { supabase } from "./lib/supabaseClient"
import { useSyncRoom, SyncEvent } from "./lib/useSyncRoom"
import type { Song } from "./types"
import SongRoutes from "./components/SongRoutes"
import "../app/globals.css"

const DEFAULT_ROOM = "sala1"

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [activeTab, setActiveTab] = useState("rock")
  const [search, setSearch] = useState("")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  
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

  const [isHost, setIsHost] = useState(false) // Por defecto oyente
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

  // Simulación de favoritas 
  const [favorites, setFavorites] = useState<Song[]>([])

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
              ? `https://qmenlmdjfxctqmgyrpka.supabase.co/storage/v1/object/public/music/${filename.replace(/^\//, "")}`
              : "",
          }
        })
        setSongs(formattedData)
      }
    }
    fetchSongs()
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filtrar canciones por título
  const filterSongs = (songs: Song[]) =>
    songs.filter(song =>
      song.title.toLowerCase().includes(search.toLowerCase())
    )
  
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
    if (event.action === "play") {
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
  }, [songs])

  const { sendSyncEvent, users } = useSyncRoom({ 
    roomId, 
    userId,
    name: userName,
    role: isHost ? "host" : "listener",
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

  // Handlers para el host
  const handlePlay = () => {
    if (!isHost) return // Solo el host puede emitir
    setIsPlaying(true)
    if (!selectedSong) return;
    sendSyncEvent({
      action: "play",
      songId: String(selectedSong.id),
      currentTime: currentTimeRef.current,
      timestamp: Date.now(),
    })
  }
  const handlePause = () => {
    if (!isHost) return // Solo el host puede emitir
    setIsPlaying(false)
    if (!selectedSong) return;
    sendSyncEvent({
      action: "pause",
      songId: String(selectedSong.id),
      currentTime: currentTimeRef.current,
      timestamp: Date.now(),
    })
  }
  const handleSliderChange = (value: number) => {
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

  const navigate = useNavigate();

  // Lista de géneros únicos
  const genres = Array.from(new Set(songs.map(song => song.genre))).filter(Boolean);

  // Handler para navegar a la ruta de género
  const handleGenreClick = (genre: string) => {
    navigate(`/category/${genre}`);
  };

  // Handler para navegar a favoritos
  const handleFavoritesClick = () => {
    navigate("/favoritos");
  };

  return (
    <div className="min-h-screen bg-rpg-dark pb-24">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-rpg-light">Mi Biblioteca Musical</h1>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar canciones..."
        />
        {/* Lista de géneros como navegación */}
        <div className="flex gap-2 mb-6">
          {genres.map(genre => (
            <button
              key={genre}
              className="px-3 py-1 rounded bg-rpg-secondary text-white hover:bg-rpg-primary transition border border-rpg-light/20"
              onClick={() => handleGenreClick(genre)}
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </button>
          ))}
          {/* Botón de favoritos */}
          <button
            className="px-3 py-1 rounded bg-rpg-accent text-white hover:bg-rpg-light hover:text-rpg-dark transition font-bold border border-rpg-light/20"
            onClick={handleFavoritesClick}
          >
            ★ Favoritos
          </button>
        </div>
        {/* Rutas principales de canciones */}
        <SongRoutes songs={songs} favorites={favorites} toggleFavorite={toggleFavorite} onSongClick={handleSongClick} />
      </main>

      <Room
        roomId={roomId}
        setRoomId={setRoomId}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        isHost={isHost}
        setIsHost={setIsHost}
        users={users}
        userName={userName}
        setUserName={setUserName}
      />
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
        isHost={isHost}
      />

    </div>
  )
}

export default App
