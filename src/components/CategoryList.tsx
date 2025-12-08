import React from "react"
import { useParams } from "react-router-dom"
import type { Song } from "../types"
import SongList from "./SongList"

// Recibe las canciones por props o contexto
const CategoryList: React.FC<{ 
  songs: Song[], 
  favorites?: Song[],
  onToggleFavorite?: (song: Song) => void, 
  onSongClick?: (song: Song) => void,
  currentSong?: Song | null,
  isPlaying?: boolean,
  isLoading?: boolean
}> = ({ songs, favorites, onToggleFavorite, onSongClick, currentSong, isPlaying, isLoading }) => {
  const { id } = useParams<{ id: string }>()
  // Filtra por género (no por category_id)
  const filtered = songs.filter(s => s.genre && s.genre.toLowerCase() === id?.toLowerCase())
  
  const bgImage = `/backgrounds/${id}.jpg`

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-lg border border-rpg-accent/30 group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 capitalize tracking-wide drop-shadow-md">
            Ambientación: {id}
          </h2>
          <p className="text-rpg-light/80 text-sm md:text-base max-w-md">
            Explora nuestra colección de sonidos para tus aventuras de {id}.
          </p>
        </div>
      </div>

      <SongList 
        songs={filtered} 
        favorites={favorites}
        onToggleFavorite={onToggleFavorite} 
        onSongClick={onSongClick} 
        currentSong={currentSong}
        isPlaying={isPlaying}
        isLoading={isLoading}
      />
      
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-rpg-light/50 italic">
          No hay canciones disponibles para este género aún.
        </div>
      )}
    </div>
  )
}

export default CategoryList
