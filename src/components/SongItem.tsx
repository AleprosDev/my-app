import type React from "react"
import { Star, ListPlus } from "lucide-react"
import type { Song } from "../types"

type SongItemProps = {
  song: Song
  onClick?: () => void
  onToggleFavorite?: (song: Song) => void
  onAddToQueue?: (song: Song) => void
  isActive?: boolean
  isPlaying?: boolean
  isFavorite?: boolean
}

const SongItem: React.FC<SongItemProps> = ({ song, onClick, onToggleFavorite, onAddToQueue, isActive, isPlaying, isFavorite = false }) => {
  return (
    <div 
      className={`
        group relative flex flex-col p-3 rounded-xl transition-all duration-300 cursor-pointer h-full
        ${isActive 
          ? "bg-rpg-secondary/40 border-2 border-rpg-accent shadow-[0_0_15px_rgba(212,255,95,0.3)]" 
          : "bg-rpg-card hover:bg-rpg-card-hover border border-transparent hover:border-rpg-accent/50"
        }
      `}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-md">
        <img
          src={song.cover_url || "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/album-cover-music%2Cspotify%2Csoundcloud-design-template-6fe6b6f76508757ab0d158df56599aa2_screen.jpg?ts=1659484258"}
          alt={song.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
        />
        
        {/* Overlay Play Button & Description */}
        <div className={`
          absolute inset-0 flex flex-col items-center justify-center bg-black/70 transition-all duration-300 p-4 text-center
          ${isActive || 'opacity-0 group-hover:opacity-100'}
        `}>
          {/* Description (Only on hover/active if available) */}
          {song.description && (
            <p className="text-xs text-white/90 mb-3 line-clamp-3 font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
              {song.description}
            </p>
          )}

          <div className={`
            w-12 h-12 rounded-full bg-rpg-accent/90 flex items-center justify-center text-rpg-dark shadow-lg backdrop-blur-sm flex-shrink-0
            ${isActive && isPlaying ? 'animate-pulse' : ''}
          `}>
            {isActive && isPlaying ? (
              // Pause Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-0">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              // Play Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-0">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <h3 className={`font-bold text-lg truncate mb-1 ${isActive ? 'text-rpg-accent' : 'text-white'}`} title={song.title}>
          {song.title}
        </h3>
        <p className="text-sm text-rpg-light/70 truncate mb-3">{song.artist}</p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
        <span className="text-xs text-rpg-light/50 font-mono">{song.duration}</span>
        
        <div className="flex gap-2">
          {onAddToQueue && (
            <button
              className="p-2 rounded-full transition-all border bg-black/30 text-rpg-light/50 border-white/10 hover:text-rpg-accent hover:border-rpg-accent"
              onClick={e => { e.stopPropagation(); onAddToQueue(song); }}
              title="Agregar a la cola"
            >
              <ListPlus size={16} />
            </button>
          )}
          
          {onToggleFavorite && (
            <button
              className={`p-2 rounded-full transition-all border ${
                isFavorite 
                  ? "bg-rpg-accent text-rpg-dark border-rpg-accent hover:bg-rpg-light" 
                  : "bg-black/30 text-rpg-light/50 border-white/10 hover:text-rpg-accent hover:border-rpg-accent"
              }`}
              onClick={e => { e.stopPropagation(); onToggleFavorite(song); }}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongItem
