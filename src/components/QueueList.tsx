import React from "react"
import { X, Trash2, Play, Music } from "lucide-react"
import type { Song } from "../types"

type QueueListProps = {
  queue: Song[]
  isOpen: boolean
  onClose: () => void
  onRemove: (index: number) => void
  onClear: () => void
  onPlay: (song: Song, index: number) => void
}

const QueueList: React.FC<QueueListProps> = ({ queue, isOpen, onClose, onRemove, onClear, onPlay }) => {
  return (
    <>
      {/* Overlay (Mobile only or always? Let's do always for focus) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-rpg-dark border-l border-rpg-light/10 shadow-2xl 
          transform transition-transform duration-300 z-50 flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-rpg-light/10 flex items-center justify-between bg-rpg-secondary/20">
          <div className="flex items-center gap-2">
            <Music className="text-rpg-accent" size={20} />
            <h2 className="text-lg font-bold text-rpg-light">Cola de Reproducción</h2>
            <span className="bg-rpg-accent/20 text-rpg-accent text-xs px-2 py-0.5 rounded-full font-mono">
              {queue.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-rpg-light/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-rpg-light/40 p-8 text-center">
              <Music size={48} className="mb-4 opacity-20" />
              <p>La cola está vacía.</p>
              <p className="text-sm mt-2">Añade canciones desde la lista para escucharlas a continuación.</p>
            </div>
          ) : (
            queue.map((song, index) => (
              <div 
                key={`${song.id}-${index}`}
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                {/* Cover tiny */}
                <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-black/30">
                  {song.cover_url ? (
                    <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Music size={16} />
                    </div>
                  )}
                  <button 
                    onClick={() => onPlay(song, index)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play size={16} className="text-white fill-white" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-rpg-light truncate">{song.title}</h4>
                  <p className="text-xs text-rpg-light/50 truncate">{song.artist}</p>
                </div>

                {/* Actions */}
                <button 
                  onClick={() => onRemove(index)}
                  className="p-2 text-rpg-light/30 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Quitar de la cola"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {queue.length > 0 && (
          <div className="p-4 border-t border-rpg-light/10 bg-rpg-secondary/10">
            <button 
              onClick={onClear}
              className="w-full py-2 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Trash2 size={16} />
              Limpiar Cola
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default QueueList