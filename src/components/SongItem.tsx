import type React from "react"
import type { Song } from "../types"

type SongItemProps = {
  song: Song
}

const SongItem: React.FC<SongItemProps> = ({ song }) => {
  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-200 transition-colors">
      <div className="h-12 w-12 flex-shrink-0 bg-gray-300 rounded overflow-hidden">
        <img
          src={song.coverUrl || `/placeholder.svg?height=48&width=48`}
          alt={`${song.title} cover`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="font-medium text-gray-900">{song.title}</h3>
        <p className="text-sm text-gray-600">{song.artist}</p>
      </div>

      <div className="text-sm text-gray-500">{song.duration}</div>
    </div>
  )
}

export default SongItem
