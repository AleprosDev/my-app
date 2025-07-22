import React from "react"
import SongList from "./SongList"
import type { Song } from "../types"

type FavoritesListProps = {
  songs: Song[]
  onToggleFavorite?: (song: Song) => void
  onSongClick?: (song: Song) => void
}

const FavoritesList: React.FC<FavoritesListProps> = ({ songs, onToggleFavorite, onSongClick }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Favoritos</h2>
      <SongList songs={songs} onToggleFavorite={onToggleFavorite} onSongClick={onSongClick} />
    </div>
  )
}

export default FavoritesList
