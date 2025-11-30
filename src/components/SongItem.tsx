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
    <div className="flex items-center p-3 bg-rpg-secondary/20 rounded-md hover:bg-rpg-secondary/40 transition-colors border border-rpg-light/10 cursor-pointer" onClick={onClick}>
      <div className="h-12 w-12 flex-shrink-0 bg-rpg-dark rounded overflow-hidden border border-rpg-accent">
        <img
          src={song.cover_url || "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/album-cover-music%2Cspotify%2Csoundcloud-design-template-6fe6b6f76508757ab0d158df56599aa2_screen.jpg?ts=1659484258"}
          alt={song.title}
          width={48}
          height={48}
          className="h-12 w-12 rounded mr-4 object-cover"
        />
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="font-medium text-white">{song.title}</h3>
        <p className="text-sm text-rpg-light/70">{song.artist}</p>
      </div>

      <div className="text-sm text-rpg-light/50">{song.duration}</div>
      {onToggleFavorite && (
        <button
          className="ml-4 text-rpg-accent hover:text-rpg-light transition-colors"
          onClick={e => { e.stopPropagation(); onToggleFavorite(song); }}
          title="Agregar/Quitar favorito"
        >★</button>
      )}
      {/* Botón para ver detalles */}
      <button
        className="ml-2 px-2 py-1 rounded bg-rpg-dark text-rpg-light hover:bg-rpg-accent hover:text-white text-xs border border-rpg-accent"
        onClick={handleDetails}
        title="Ver detalles"
      >Detalles</button>
    </div>
  )
}

export default SongItem
