import type React from "react"
import type { Song } from "../types"

type SongItemProps = {
  song: Song
  onClick?: () => void
  onToggleFavorite?: (song: Song) => void
  isActive?: boolean
  isPlaying?: boolean
}

const SongItem: React.FC<SongItemProps> = ({ song, onClick, onToggleFavorite, isActive, isPlaying }) => {
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
        
        {/* Overlay Play Button */}
        <div className={`
          absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300
          ${isActive || 'opacity-0 group-hover:opacity-100'}
        `}>
          <div className={`
            w-12 h-12 rounded-full bg-rpg-accent/90 flex items-center justify-center text-rpg-dark shadow-lg backdrop-blur-sm
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
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
        
        {onToggleFavorite && (
          <button
            className="px-3 py-1 rounded-full text-xs font-bold bg-black/30 hover:bg-rpg-accent hover:text-rpg-dark text-rpg-light transition-all border border-white/10"
            onClick={e => { e.stopPropagation(); onToggleFavorite(song); }}
          >
            Favoritos
          </button>
        )}
      </div>
    </div>
  )
}

export default SongItem
