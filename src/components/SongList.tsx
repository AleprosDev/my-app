import type React from "react"
import SongItem from "./SongItem"
import type { Song } from "../types"

type SongListProps = {
  songs: Song[]
}

const SongList: React.FC<SongListProps> = ({ songs }) => {
  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <SongItem key={song.id} song={song} />
      ))}
    </div>
  )
}

export default SongList
