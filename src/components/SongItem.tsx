import type React from "react"
import { Star, ListPlus, MoreVertical, Play, Pause } from "lucide-react"
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
  // Mock popularity for now
  const isPopular = Math.random() > 0.7;
  const isNew = Math.random() > 0.8;

  return (
    <div 
      className={`
        group relative flex flex-col p-4 rounded-2xl transition-all duration-300 cursor-pointer h-full
        ${isActive 
          ? "bg-rpg-card border border-rpg-accent shadow-[0_8px_30px_rgba(57,255,20,0.15)] translate-y-[-4px]" 
          : "bg-rpg-card border border-white/5 hover:border-white/20 hover:shadow-xl hover:translate-y-[-4px] hover:bg-rpg-card-hover"
        }
      `}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 shadow-lg bg-black/50">
        <img
          src={song.cover_url || "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/album-cover-music%2Cspotify%2Csoundcloud-design-template-6fe6b6f76508757ab0d158df56599aa2_screen.jpg?ts=1659484258"}
          alt={song.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rpg-accent text-rpg-dark rounded-full shadow-sm">
              New
            </span>
          )}
          {isPopular && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rpg-secondary text-white rounded-full shadow-sm">
              Hot
            </span>
          )}
        </div>

        {/* Overlay Play Button & Description */}
        <div className={`
          absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition-all duration-300 p-4 text-center
          ${isActive || 'opacity-0 group-hover:opacity-100'}
        `}>
          {/* Description (Only on hover/active if available) */}
          {song.description && (
            <p className="text-xs text-white/90 mb-4 line-clamp-3 font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 drop-shadow-md">
              {song.description}
            </p>
          )}

          <div className={`
            w-14 h-14 rounded-full bg-rpg-accent flex items-center justify-center text-rpg-dark shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-transform duration-200 hover:scale-110
            ${isActive && isPlaying ? 'animate-pulse-slow' : ''}
          `}>
            {isActive && isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className={`font-bold text-lg leading-tight line-clamp-1 ${isActive ? 'text-rpg-accent' : 'text-white'}`} title={song.title}>
            {song.title}
          </h3>
          {/* Menu dots (visual only for now) */}
          <button className="text-rpg-muted hover:text-white transition-colors p-1 -mr-2 -mt-1">
            <MoreVertical size={16} />
          </button>
        </div>
        
        <p className="text-sm text-rpg-muted font-medium mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rpg-secondary/50"></span>
          {song.artist}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <span className="text-xs text-rpg-muted/70 font-mono bg-white/5 px-2 py-1 rounded-md">
          {song.duration}
        </span>
        
        <div className="flex gap-2">
          {onAddToQueue && (
            <button
              className="p-2.5 rounded-full transition-all bg-white/5 text-rpg-muted hover:bg-rpg-accent hover:text-rpg-dark hover:shadow-lg hover:shadow-rpg-accent/20 active:scale-95"
              onClick={e => { e.stopPropagation(); onAddToQueue(song); }}
              title="Agregar a la cola"
            >
              <ListPlus size={18} />
            </button>
          )}
          
          {onToggleFavorite && (
            <button
              className={`p-2.5 rounded-full transition-all active:scale-95 ${
                isFavorite 
                  ? "bg-rpg-accent text-rpg-dark shadow-lg shadow-rpg-accent/20 hover:bg-white" 
                  : "bg-white/5 text-rpg-muted hover:bg-rpg-accent hover:text-rpg-dark hover:shadow-lg hover:shadow-rpg-accent/20"
              }`}
              onClick={e => { e.stopPropagation(); onToggleFavorite(song); }}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongItem
