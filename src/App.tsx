"use client"

import { useEffect, useState, useCallback } from "react"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
import SongList from "./components/SongList"
import SearchBar from "./components/SearchBar"
import Room from "./components/Room"
import Player from "./components/Player"
import { supabase } from "./lib/supabaseClient"
import { useSyncRoom, SyncEvent } from "./lib/useSyncRoom"
import type { Song } from "./types"

const DEFAULT_ROOM = "sala1"

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [activeTab, setActiveTab] = useState("rock")
  const [search, setSearch] = useState("")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Estado de sala y rol
  const [roomId, setRoomId] = useState(DEFAULT_ROOM)
  const [isHost, setIsHost] = useState(true) // Cambia a false para probar como oyente

  // Cargar canciones desde Supabase
  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from("songs").select("*")
      console.log("Supabase data:", data, "error:", error)
      if (!error && data) setSongs(data)
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
  
  // Handler para SongItem
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
      // Emitir play inmediatamente después para que los oyentes reproduzcan automáticamente
      sendSyncEvent({
        action: "play",
        songId: String(song.id),
        currentTime: 0,
        timestamp: Date.now(),
      })
    }
  }

  // Sincronización con Supabase
  const onSyncEvent = useCallback((event: SyncEvent) => {
    if (event.action === "play") {
      // Buscar la canción por ID y seleccionarla si es diferente
      const song = songs.find(s => String(s.id) === event.songId)
      if (song) setSelectedSong(song)
      setIsPlaying(true)
      setProgress(event.currentTime)
    } else if (event.action === "pause") {
      setIsPlaying(false)
      setProgress(event.currentTime)
    } else if (event.action === "seek") {
      setProgress(event.currentTime)
    } else if (event.action === "change_song") {
      // Buscar la canción por ID y seleccionarla
      const song = songs.find(s => String(s.id) === event.songId)
      if (song) setSelectedSong(song)
      setProgress(0)
    }
  }, [songs])

  const { sendSyncEvent } = useSyncRoom({ roomId, onEvent: onSyncEvent })

  // Handlers para el host
  const handlePlay = () => {
    if (!isHost) return // Solo el host puede emitir
    setIsPlaying(true)
    if (!selectedSong) return;
    sendSyncEvent({
      action: "play",
      songId: String(selectedSong.id),
      currentTime: progress,
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
      currentTime: progress,
      timestamp: Date.now(),
    })
  }
  const handleSliderChange = (value: number) => {
    setProgress(value)
    if (isHost && selectedSong) {
      sendSyncEvent({
        action: "seek",
        songId: String(selectedSong.id),
        currentTime: value,
        timestamp: Date.now(),
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Mi Biblioteca Musical</h1>
        
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar canciones..."
        />

        {mounted && (
          <>
            {activeTab === "rock" && (
              <Container title="Rock Clásico">
                <SongList
                  songs={filterSongs(songs.filter(song => song.genre === "rock"))}
                  onSongClick={handleSongClick}
                />
              </Container>
            )}

            {activeTab === "pop" && (
              <Container title="Pop Hits">
                <SongList
                  songs={filterSongs(songs.filter(song => song.genre === "pop"))}
                  onSongClick={handleSongClick}
                />
              </Container>
            )}

            {activeTab === "jazz" && (
              <Container title="Jazz & Blues">
                <SongList
                  songs={filterSongs(songs.filter(song => song.genre === "jazz"))}
                  onSongClick={handleSongClick}
                />
              </Container>
            )}

            {activeTab === "electronic" && (
              <Container title="Música Electrónica">
                <SongList
                  songs={filterSongs(songs.filter(song => song.genre === "electronic"))}
                  onSongClick={handleSongClick}
                />
              </Container>
            )}

            <Container title="Todas las canciones">
              <SongList
                songs={filterSongs(songs)}
                onSongClick={handleSongClick}
              />
            </Container>
          </>
        )}
      </main>

      <Room
        roomId={roomId}
        setRoomId={setRoomId}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        isHost={isHost}
        setIsHost={setIsHost}
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
      />

    </div>
  )
}

export default App
