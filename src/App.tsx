"use client"

import { useState } from "react"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
import SongList from "./components/SongList"
import { rockSongs, popSongs, jazzSongs, electronicSongs } from "./data/songs"

function App() {
  const [activeTab, setActiveTab] = useState("rock")

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Mi Biblioteca Musical</h1>

        {activeTab === "rock" && (
          <Container title="Rock Clásico">
            <SongList songs={rockSongs} />
          </Container>
        )}

        {activeTab === "pop" && (
          <Container title="Pop Hits">
            <SongList songs={popSongs} />
          </Container>
        )}

        {activeTab === "jazz" && (
          <Container title="Jazz & Blues">
            <SongList songs={jazzSongs} />
          </Container>
        )}

        {activeTab === "electronic" && (
          <Container title="Música Electrónica">
            <SongList songs={electronicSongs} />
          </Container>
        )}
      </main>
    </div>
  )
}

export default App
