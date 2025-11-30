import React, { useState } from "react"
import { RoomUser } from "../lib/useSyncRoom"

interface RoomProps {
  roomId: string
  setRoomId: (id: string) => void
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  isHost: boolean
  setIsHost: (isHost: boolean) => void
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
  isHost, 
  setIsHost,
  users,
  userName,
  setUserName
}) => {
  const [input, setInput] = useState(roomId)
  // El rol local se deriva de isHost
  const role = isHost ? "host" : "listener"

  // Detectar si ya hay un host en la sala (excluyéndome a mí mismo si soy host)
  // Nota: users puede contener duplicados si la presencia no se limpia bien, filtramos por ID único si es posible, o confiamos en el role
  const activeHost = users.find(u => u.role === "host")
  
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    setRoomId(input)
    // Al cambiar de sala, siempre entramos como oyentes por seguridad
    setIsHost(false)
  }

  const handleClaimHost = () => {
    if (activeHost && activeHost.name !== userName) {
      alert("Ya hay un Dungeon Master en esta sala.")
      return
    }
    const password = prompt("Introduce la clave de Dungeon Master:")
    // Aquí podrías validar contra una clave real o variable de entorno
    // Por ahora usamos una clave simple "admin" o permitimos cualquiera si es el primero
    if (password === "admin") {
      setIsHost(true)
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
      
      <div className="flex items-center gap-2">
        <div className="text-rpg-light">Rol: <span className="font-bold text-rpg-primary">{isHost ? "Dungeon Master" : "Oyente"}</span></div>
        {!isHost && !activeHost && (
          <button 
            onClick={handleClaimHost}
            className="text-xs bg-rpg-accent text-white px-2 py-1 rounded hover:bg-rpg-light hover:text-rpg-dark transition font-bold"
          >
            Reclamar DM
          </button>
        )}
        {!isHost && activeHost && (
          <span className="text-xs text-rpg-light/70 italic">(DM: {activeHost.name || "Anónimo"})</span>
        )}
        {isHost && (
          <button 
            onClick={() => setIsHost(false)}
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
              <span className={`font-bold ${u.role === "host" ? "text-rpg-primary" : "text-rpg-light/80"}`}>
                {u.role === "host" ? "DM" : "Oyente"}
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
          Usa los controles del reproductor inferior para controlar la música.
        </div>
      )}
    </div>
  )
}

export default Room
