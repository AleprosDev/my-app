import React from "react"
import { useParams } from "react-router-dom"
import type { Song } from "../types"
import SongItem from "./SongItem"

const SongDetail: React.FC<{ 
  songs: Song[], 
  onToggleFavorite?: (song: Song) => void, 
  onSongClick?: (song: Song) => void,
  onAddToQueue?: (song: Song) => void
}> = ({ songs, onToggleFavorite, onSongClick, onAddToQueue }) => {
  const { id } = useParams<{ id: string }>()
  const song = songs.find(s => String(s.id) === id)
  if (!song) return <div className="text-rpg-light/70">No se encontró la canción</div>
  return (
    <div className="p-4 text-rpg-light">
      <h2 className="text-2xl font-bold mb-4 text-rpg-primary">Detalles de la canción</h2>
      <SongItem 
        song={song} 
        onToggleFavorite={onToggleFavorite} 
        onClick={() => onSongClick?.(song)} 
        onAddToQueue={onAddToQueue}
      />
      <div className="mt-4">
        <div><strong>Artista:</strong> {song.artist}</div>
        <div><strong>Duración:</strong> {song.duration}</div>
        <div><strong>Género:</strong> {song.genre}</div>
        {/* Puedes agregar más detalles aquí si lo deseas */}
      </div>
    </div>
  )
}

export default SongDetail
