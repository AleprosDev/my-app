import React from "react"
import SongList from "./SongList"
import type { Song } from "../types"

type FavoritesListProps = {
  songs: Song[]
  onToggleFavorite?: (song: Song) => void
  onSongClick?: (song: Song) => void
  currentSong?: Song | null
  isPlaying?: boolean
}

const FavoritesList: React.FC<FavoritesListProps> = ({ songs, onToggleFavorite, onSongClick, currentSong, isPlaying }) => {
  const bgImage = "/backgrounds/favorites.jpg"

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
            Mis Favoritos
          </h2>
          <p className="text-rpg-light/80 text-sm md:text-base max-w-md">
            Tu colección personal de sonidos épicos.
          </p>
        </div>
      </div>

      <SongList 
        songs={songs} 
        favorites={songs}
        onToggleFavorite={onToggleFavorite} 
        onSongClick={onSongClick} 
        currentSong={currentSong}
        isPlaying={isPlaying}
      />
      
      {songs.length === 0 && (
        <div className="text-center py-12 text-rpg-light/50 italic">
          Aún no has agregado canciones a tus favoritos.
        </div>
      )}
    </div>
  )
}

export default FavoritesList
