import React, { useState, useEffect } from "react"
import { RoomUser } from "../lib/useSyncRoom"
import { useToast } from "./ui/Toast"
import { X, Users, Copy, LogIn, Crown, Radio, ChevronUp, ChevronDown, User } from "lucide-react"

interface RoomProps {
  roomId: string
  setRoomId: (id: string) => void
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  connectionMode: "spectator" | "listener" | "host"
  setConnectionMode: (mode: "spectator" | "listener" | "host") => void
  users: RoomUser[]
  userName: string
  setUserName: (name: string) => void
}

const Room: React.FC<RoomProps> = ({ 
  roomId, 
  setRoomId, 
  connectionMode,
  setConnectionMode,
  users,
  userName,
  setUserName
}) => {
  const [input, setInput] = useState(roomId)
  const { addToast } = useToast()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const isHost = connectionMode === "host"
  const isListener = connectionMode === "listener"
  const isSpectator = connectionMode === "spectator"

  const activeHost = users.find(u => u.role === "host")
  
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setRoomId(input)
    setConnectionMode("spectator")
    addToast(`Te has unido a la sala: ${input}`, "info")
  }

  const handleClaimHost = () => {
    if (activeHost && activeHost.name !== userName) {
      addToast("Ya hay un Dungeon Master en esta sala.", "error")
      return
    }
    setShowPasswordModal(true)
  }

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === "admin") {
      setConnectionMode("host")
      addToast("¡Ahora eres el Dungeon Master!", "success")
      setShowPasswordModal(false)
    } else {
      addToast("Clave incorrecta", "error")
    }
    setPasswordInput("")
  }

  // Auto-collapse on mobile initially
  useEffect(() => {
    if (window.innerWidth > 768) {
      setIsExpanded(true)
    }
  }, [])

  return (
    <>
      {/* Floating Toggle Button (Visible when collapsed) */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-24 right-4 z-40 bg-rpg-card border border-rpg-accent text-rpg-accent p-3 rounded-full shadow-lg hover:bg-rpg-accent hover:text-rpg-dark transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        >
          <Users size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
            {users.length}
          </span>
        </button>
      )}

      {/* Main Panel */}
      <div className={`
        fixed bottom-24 right-4 z-40 w-80 bg-rpg-card/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden
        ${isExpanded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-rpg-accent" />
            <h3 className="font-bold text-white">Sala de Sesión</h3>
          </div>
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-rpg-muted hover:text-white transition-colors"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Room ID & User Name Form */}
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="text-xs text-rpg-muted uppercase font-bold tracking-wider mb-1 block">Tu Nombre</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rpg-muted" />
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Nombre..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-rpg-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-rpg-muted uppercase font-bold tracking-wider mb-1 block">ID de Sala</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-rpg-accent focus:outline-none transition-colors font-mono"
                />
                <button 
                  type="submit" 
                  className="bg-rpg-accent text-rpg-dark p-2 rounded-lg hover:bg-rpg-accent-hover transition-colors"
                  title="Ir a Sala"
                >
                  <LogIn size={18} />
                </button>
              </div>
            </div>
          </form>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const url = `${window.location.origin}/?room=${roomId}`
                navigator.clipboard.writeText(url)
                addToast("Link copiado", "success")
              }}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-rpg-light py-2 rounded-lg text-xs font-medium transition-colors border border-white/5"
            >
              <Copy size={14} /> Copiar Link
            </button>
            
            {!isHost && !activeHost ? (
              <button 
                onClick={handleClaimHost}
                className="flex items-center justify-center gap-2 bg-rpg-secondary/20 hover:bg-rpg-secondary/40 text-rpg-secondary hover:text-white py-2 rounded-lg text-xs font-medium transition-colors border border-rpg-secondary/30"
              >
                <Crown size={14} /> Ser DM
              </button>
            ) : isHost ? (
              <button 
                onClick={() => {
                  setConnectionMode("spectator")
                  addToast("Has dejado de ser DM", "info")
                }}
                className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-xs font-medium transition-colors border border-red-500/20"
              >
                <LogOutIcon /> Dejar DM
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1 text-xs text-rpg-muted bg-black/20 rounded-lg border border-white/5">
                <Crown size={12} className="text-rpg-secondary" />
                DM: {activeHost?.name || "..."}
              </div>
            )}
          </div>

          {/* Connection Mode */}
          <div className="bg-black/20 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rpg-muted uppercase">Tu Estado</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isHost ? "bg-rpg-accent/20 text-rpg-accent" :
                isListener ? "bg-blue-500/20 text-blue-400" :
                "bg-white/10 text-rpg-muted"
              }`}>
                {isHost ? "Dungeon Master" : isListener ? "Sincronizado" : "Local"}
              </span>
            </div>
            
            {isSpectator && (
              <button 
                onClick={() => {
                  setConnectionMode("listener")
                  addToast("Sincronizado con la sesión", "success")
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-900/20"
              >
                <Radio size={14} /> Unirse a la Sesión
              </button>
            )}

            {isListener && (
              <button 
                onClick={() => {
                  setConnectionMode("spectator")
                  addToast("Modo local activado", "info")
                }}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-medium transition-colors"
              >
                <X size={14} /> Desvincularse
              </button>
            )}
          </div>

          {/* User List */}
          <div>
            <h4 className="text-xs font-bold text-rpg-muted uppercase mb-2 flex items-center justify-between">
              Usuarios ({users.length})
            </h4>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${u.role === 'host' ? 'bg-rpg-accent text-rpg-dark' : 'bg-white/10 text-rpg-light'}
                  `}>
                    {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {u.name || "Anónimo"}
                      {u.id === users.find(me => me.name === userName)?.id && " (Tú)"}
                    </div>
                    <div className="text-[10px] text-rpg-muted uppercase tracking-wider">
                      {u.role === 'host' ? 'Dungeon Master' : u.role === 'listener' ? 'Oyente' : 'Espectador'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={submitPassword} className="bg-rpg-card border border-rpg-accent p-6 rounded-2xl shadow-2xl w-full max-w-xs animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Clave de DM</h3>
              <button type="button" onClick={() => setShowPasswordModal(false)} className="text-rpg-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Contraseña..."
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-rpg-accent outline-none text-center tracking-widest"
              autoFocus
            />
            <button type="submit" className="w-full bg-rpg-accent text-rpg-dark font-bold py-3 rounded-lg hover:bg-rpg-accent-hover transition shadow-lg shadow-rpg-accent/20">
              Acceder
            </button>
          </form>
        </div>
      )}
    </>
  )
}

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export default Room
