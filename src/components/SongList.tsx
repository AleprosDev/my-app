import type React from "react"
import SongItem from "./SongItem"
import type { Song } from "../types"

type SongListProps = {
  songs: Song[]
  onSongClick?: (song: Song) => void
  onToggleFavorite?: (song: Song) => void
  currentSong?: Song | null
  isPlaying?: boolean
}

const SongList: React.FC<SongListProps> = ({ songs, onSongClick, onToggleFavorite, currentSong, isPlaying }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          onClick={() => onSongClick?.(song)}
          onToggleFavorite={onToggleFavorite}
          isActive={currentSong?.id === song.id}
          isPlaying={isPlaying && currentSong?.id === song.id}
        />
      ))}
    </div>
  )
}

export default SongList
