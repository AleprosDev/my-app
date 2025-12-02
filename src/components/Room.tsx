import React, { useState } from "react"
import { RoomUser } from "../lib/useSyncRoom"

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
  isPlaying, 
  onPlay, 
  onPause, 
  connectionMode,
  setConnectionMode,
  users,
  userName,
  setUserName
}) => {
  const [input, setInput] = useState(roomId)
  const isHost = connectionMode === "host"
  const isListener = connectionMode === "listener"
  const isSpectator = connectionMode === "spectator"

  // Detectar si ya hay un host en la sala (excluyéndome a mí mismo si soy host)
  const activeHost = users.find(u => u.role === "host")
  
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    setRoomId(input)
    // Al cambiar de sala, volvemos a espectador por defecto
    setConnectionMode("spectator")
  }

  const handleClaimHost = () => {
    if (activeHost && activeHost.name !== userName) {
      alert("Ya hay un Dungeon Master en esta sala.")
      return
    }
    const password = prompt("Introduce la clave de Dungeon Master:")
    if (password === "admin") {
      setConnectionMode("host")
    } else {
      alert("Clave incorrecta")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-rpg-dark rounded shadow-md border-2 border-rpg-accent">
      <form onSubmit={handleJoin} className="flex gap-2 items-center flex-wrap justify-center">
        <label className="font-semibold text-rpg-light">Room ID:</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border border-rpg-secondary bg-rpg-secondary/20 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rpg-primary placeholder-rpg-light/30"
        />
        <input
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="Tu nombre"
          className="border border-rpg-secondary bg-rpg-secondary/20 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rpg-primary placeholder-rpg-light/30"
          style={{ minWidth: 80 }}
        />
        <button type="submit" className="bg-rpg-primary text-rpg-dark font-bold px-3 py-1 rounded hover:bg-rpg-light transition">Ir a Sala</button>
      </form>
      <div className="text-rpg-light">Sala actual: <span className="font-mono font-bold text-rpg-primary">{roomId}</span></div>
      <button
        onClick={() => {
          const url = `${window.location.origin}/?room=${roomId}`
          navigator.clipboard.writeText(url)
          alert("Link copiado al portapapeles: " + url)
        }}
        className="text-xs bg-rpg-secondary text-white hover:bg-rpg-primary hover:text-rpg-dark px-2 py-1 rounded border border-rpg-light/20 transition"
      >
        Copiar Link de Invitación
      </button>
      
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <div className="text-rpg-light mr-2">Modo: 
          <span className="font-bold text-rpg-primary ml-1">
            {isHost ? "Dungeon Master" : isListener ? "Sincronizado" : "Espectador (Local)"}
          </span>
        </div>

        {/* Botones de cambio de modo */}
        {isSpectator && (
          <button 
            onClick={() => setConnectionMode("listener")}
            className="text-xs bg-rpg-secondary text-white px-2 py-1 rounded hover:bg-rpg-primary hover:text-rpg-dark transition font-bold border border-rpg-light/20"
            title="Sincronizarse con lo que escucha el DM"
          >
            Unirse a la Sesión (Sincronizar)
          </button>
        )}

        {isListener && (
          <button 
            onClick={() => setConnectionMode("spectator")}
            className="text-xs bg-rpg-dark text-rpg-light px-2 py-1 rounded hover:bg-rpg-secondary transition border border-rpg-light/20"
            title="Escuchar música por mi cuenta"
          >
            Desvincularse (Modo Local)
          </button>
        )}

        {!isHost && !activeHost && (
          <button 
            onClick={handleClaimHost}
            className="text-xs bg-rpg-accent text-white px-2 py-1 rounded hover:bg-rpg-light hover:text-rpg-dark transition font-bold"
          >
            Reclamar DM
          </button>
        )}
        
        {!isHost && activeHost && (
          <span className="text-xs text-rpg-light/70 italic ml-2">(DM: {activeHost.name || "Anónimo"})</span>
        )}
        
        {isHost && (
          <button 
            onClick={() => setConnectionMode("spectator")}
            className="text-xs text-rpg-light/60 hover:text-red-400 hover:underline ml-2 transition-colors"
          >
            Dejar puesto
          </button>
        )}
      </div>

      <div className="w-full mt-2">
        <div className="font-semibold mb-1 text-rpg-light">Usuarios conectados:</div>
        <ul className="text-sm space-y-1">
          {users.map(u => (
            <li key={u.id} className="flex items-center gap-2 bg-rpg-secondary/20 p-1 rounded border border-rpg-light/5">
              <span className="font-mono text-rpg-light/40 text-xs">{u.id.slice(-4)}</span>
              <span className={`font-bold ${
                u.role === "host" ? "text-rpg-primary" : 
                u.role === "listener" ? "text-rpg-light/80" : "text-rpg-light/50"
              }`}>
                {u.role === "host" ? "DM" : u.role === "listener" ? "Oyente" : "Espectador"}
              </span>
              {u.name && (
                <span className="text-white font-semibold ml-2">{u.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {isHost && (
        <div className="text-xs text-rpg-light/60 mt-2 italic">
          Usa los controles del reproductor inferior para controlar la música de la sala.
        </div>
      )}
      {isSpectator && (
        <div className="text-xs text-rpg-light/60 mt-2 italic">
          Estás en modo local. No escuchas lo que pone el DM hasta que te unas a la sesión.
        </div>
      )}
    </div>
  )
}

export default Room
