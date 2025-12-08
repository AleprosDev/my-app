import type React from "react"
import SongItem from "./SongItem"
import type { Song } from "../types"
import { Skeleton } from "./ui/Skeleton"

type SongListProps = {
  songs: Song[]
  favorites?: Song[]
  onSongClick?: (song: Song) => void
  onToggleFavorite?: (song: Song) => void
  onAddToQueue?: (song: Song) => void
  currentSong?: Song | null
  isPlaying?: boolean
  isLoading?: boolean
}

const SongList: React.FC<SongListProps> = ({ songs, favorites = [], onSongClick, onToggleFavorite, onAddToQueue, currentSong, isPlaying, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-rpg-secondary/10 rounded-lg p-3 space-y-3 border border-rpg-light/5">
            <Skeleton className="w-full aspect-square rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          onClick={() => onSongClick?.(song)}
          onToggleFavorite={onToggleFavorite}
          onAddToQueue={onAddToQueue}
          isActive={currentSong?.id === song.id}
          isPlaying={isPlaying && currentSong?.id === song.id}
          isFavorite={favorites.some(f => f.id === song.id)}
        />
      ))}
    </div>
  )
}

export default SongList
