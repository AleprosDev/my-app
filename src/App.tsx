"use client"

import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
import SongList from "./components/SongList"
import SearchBar from "./components/SearchBar"
import Player from "./components/Player"
import { supabase } from "./lib/supabaseClient"
import type { Song } from "./types"

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [activeTab, setActiveTab] = useState("rock")
  const [search, setSearch] = useState("")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

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
  }

  // Handler para slider
  const handleSliderChange = (value: number) => {
    setProgress(value)
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

      {selectedSong && (
        <Player
          song={{
            ...selectedSong,
            cover_url: selectedSong.cover_url || "",
            audio_url: selectedSong.audio_url || ""
          }}
          isPlaying={isPlaying}
          progress={progress}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onSliderChange={handleSliderChange}
        />
      )}

    </div>
  )
}

export default App
