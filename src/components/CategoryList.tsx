import React from "react"
import { useParams } from "react-router-dom"
import type { Song } from "../types"
import SongList from "./SongList"

// Recibe las canciones por props o contexto
const CategoryList: React.FC<{ songs: Song[], onToggleFavorite?: (song: Song) => void, onSongClick?: (song: Song) => void }> = ({ songs, onToggleFavorite, onSongClick }) => {
  const { id } = useParams<{ id: string }>()
  // Filtra por género (no por category_id)
  const filtered = songs.filter(s => s.genre && s.genre.toLowerCase() === id?.toLowerCase())
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Género: {id}</h2>
      <SongList songs={filtered} onToggleFavorite={onToggleFavorite} onSongClick={onSongClick} />
      {filtered.length === 0 && (
        <div className="text-gray-500">No hay canciones para este género.</div>
      )}
    </div>
  )
}

export default CategoryList
