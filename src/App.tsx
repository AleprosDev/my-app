"use client"

import { useState } from "react"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
import SongList from "./components/SongList"
import SearchBar from "./components/SearchBar"
import Player from "./components/Player"
import { rockSongs, popSongs, jazzSongs, electronicSongs } from "./data/songs"

import type { Song } from "./types"

function App() {
  const [activeTab, setActiveTab] = useState("rock")
  const [search, setSearch] = useState("")

  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Función para filtrar canciones por título
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

        {activeTab === "rock" && (
          <Container title="Rock Clásico">
            <SongList songs={filterSongs(rockSongs)} onSongClick={handleSongClick}/>
          </Container>
        )}

        {activeTab === "pop" && (
          <Container title="Pop Hits">
            <SongList songs={filterSongs(popSongs)} onSongClick={handleSongClick}/>
          </Container>
        )}

        {activeTab === "jazz" && (
          <Container title="Jazz & Blues">
            <SongList songs={filterSongs(jazzSongs)} onSongClick={handleSongClick}/>
          </Container>
        )}

        {activeTab === "electronic" && (
          <Container title="Música Electrónica">
            <SongList songs={filterSongs(electronicSongs)} onSongClick={handleSongClick}/>
          </Container>
        )}

        <Container title="Todas las canciones">
          <SongList
            songs={filterSongs([
              ...rockSongs,
              ...popSongs,
              ...jazzSongs,
              ...electronicSongs,
            ])}
            onSongClick={handleSongClick}
          />
        </Container>
      </main>

      {selectedSong && (
        <Player
          song={{
            ...selectedSong,
            coverUrl: selectedSong.coverUrl ?? ""
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
