import type React from "react"
import SongItem from "./SongItem"
import type { Song } from "../types"

type SongListProps = {
  songs: Song[]
  onSongClick?: (song: Song) => void
  onToggleFavorite?: (song: Song) => void
}

const SongList: React.FC<SongListProps> = ({ songs, onSongClick, onToggleFavorite }) => {
  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          onClick={() => onSongClick?.(song)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

export default SongList
