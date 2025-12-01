import type React from "react"
import type { Song } from "../types"
import { useNavigate } from "react-router-dom"

type SongItemProps = {
  song: Song
  onClick?: () => void
  onToggleFavorite?: (song: Song) => void
}

const SongItem: React.FC<SongItemProps> = ({ song, onClick, onToggleFavorite }) => {
  const navigate = useNavigate();
  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/song/${song.id}`);
  };
  return (
    <div className="flex flex-col p-3 bg-rpg-secondary/20 rounded-md hover:bg-rpg-secondary/40 transition-colors border border-rpg-light/10 cursor-pointer h-full" onClick={onClick}>
      <div className="w-full aspect-square bg-rpg-dark rounded overflow-hidden border border-rpg-accent mb-3">
        <img
          src={song.cover_url || "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/album-cover-music%2Cspotify%2Csoundcloud-design-template-6fe6b6f76508757ab0d158df56599aa2_screen.jpg?ts=1659484258"}
          alt={song.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="font-medium text-white truncate" title={song.title}>{song.title}</h3>
        <p className="text-sm text-rpg-light/70 truncate">{song.artist}</p>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-rpg-light/10">
        <span className="text-xs text-rpg-light/50">{song.duration}</span>
        <div className="flex gap-2">
          {onToggleFavorite && (
            <button
              className="text-rpg-accent hover:text-rpg-light transition-colors text-lg leading-none"
              onClick={e => { e.stopPropagation(); onToggleFavorite(song); }}
              title="Agregar/Quitar favorito"
            >★</button>
          )}
          <button
            className="px-2 py-1 rounded bg-rpg-dark text-rpg-light hover:bg-rpg-accent hover:text-white text-xs border border-rpg-accent"
            onClick={handleDetails}
            title="Ver detalles"
          >Detalles</button>
        </div>
      </div>
    </div>
  )
}

export default SongItem
