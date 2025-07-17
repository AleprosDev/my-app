import type React from "react"
import type { Song } from "../types"
import Image from "next/image"

type SongItemProps = {
  song: Song
  onClick?: () => void
}

const SongItem: React.FC<SongItemProps> = ({ song, onClick }) => {
  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-200 transition-colors" onClick={onClick}>
      <div className="h-12 w-12 flex-shrink-0 bg-gray-300 rounded overflow-hidden">
        <Image
          src={song.cover_url || "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/album-cover-music%2Cspotify%2Csoundcloud-design-template-6fe6b6f76508757ab0d158df56599aa2_screen.jpg?ts=1659484258"}
          alt={song.title}
          width={48}
          height={48}
          className="h-12 w-12 rounded mr-4 object-cover"
          unoptimized
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
