import React, { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

interface RoomUser {
  id: string
  role: "host" | "listener"
  name?: string
}

interface RoomProps {
  roomId: string
  setRoomId: (id: string) => void
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  isHost: boolean
  setIsHost: (isHost: boolean) => void
}

const Room: React.FC<RoomProps> = ({ roomId, setRoomId, isPlaying, onPlay, onPause, isHost, setIsHost }) => {
  const [input, setInput] = useState(roomId)
  // El rol local se deriva de isHost
  const role = isHost ? "host" : "listener"
  const [users, setUsers] = useState<RoomUser[]>([])
  const [name, setName] = useState(() => localStorage.getItem("room_user_name") || "")

  // Detectar si ya hay un host en la sala (excluyéndome a mí mismo si soy host)
  // Nota: users puede contener duplicados si la presencia no se limpia bien, filtramos por ID único si es posible, o confiamos en el role
  const activeHost = users.find(u => u.role === "host")
  
  // Guardar el nombre en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("room_user_name", name)
  }, [name])

  // Presencia en tiempo real usando Supabase Realtime
  useEffect(() => {
    const channel = supabase.channel(`room-presence:${roomId}`, {
      config: { presence: { key: "user" } }
    })
    // Generar ID persistente para esta sesión
    const userId = localStorage.getItem("room_user_id") || `${Math.random().toString(36).slice(2)}-${Date.now()}`
    localStorage.setItem("room_user_id", userId)

    let unsubscribed = false
    channel.subscribe()
    
    // Esperar a que el canal esté realmente suscrito antes de trackear presencia
    const waitForJoined = setInterval(() => {
      if (unsubscribed) return
      if (channel.state === 'joined') {
        channel.track({ id: userId, role, name })
        clearInterval(waitForJoined)
      }
    }, 100)
    
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const userList: RoomUser[] = []
      Object.values(state).forEach((arr: unknown) => {
        (arr as RoomUser[]).forEach((u: RoomUser) => userList.push(u))
      })
      setUsers(userList)
    })
    return () => {
      unsubscribed = true
      clearInterval(waitForJoined)
      channel.unsubscribe()
    }
  }, [roomId, role, name])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    setRoomId(input)
    // Al cambiar de sala, siempre entramos como oyentes por seguridad
    setIsHost(false)
  }

  const handleClaimHost = () => {
    if (activeHost && activeHost.name !== name) {
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
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded shadow-md">
      <form onSubmit={handleJoin} className="flex gap-2 items-center flex-wrap justify-center">
        <label className="font-semibold">Room ID:</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre"
          className="border rounded px-2 py-1"
          style={{ minWidth: 80 }}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Ir a Sala</button>
      </form>
      <div className="text-gray-700">Sala actual: <span className="font-mono">{roomId}</span></div>
      <button
        onClick={() => {
          const url = `${window.location.origin}/?room=${roomId}`
          navigator.clipboard.writeText(url)
          alert("Link copiado al portapapeles: " + url)
        }}
        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
      >
        Copiar Link de Invitación
      </button>
      
      <div className="flex items-center gap-2">
        <div className="text-gray-700">Rol: <span className="font-bold">{isHost ? "Dungeon Master" : "Oyente"}</span></div>
        {!isHost && !activeHost && (
          <button 
            onClick={handleClaimHost}
            className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300 hover:bg-yellow-200"
          >
            Reclamar DM
          </button>
        )}
        {!isHost && activeHost && (
          <span className="text-xs text-gray-500 italic">(DM: {activeHost.name || "Anónimo"})</span>
        )}
        {isHost && (
          <button 
            onClick={() => setIsHost(false)}
            className="text-xs text-red-500 hover:underline ml-2"
          >
            Dejar puesto
          </button>
        )}
      </div>

      <div className="w-full mt-2">
        <div className="font-semibold mb-1">Usuarios conectados:</div>
        <ul className="text-sm">
          {users.map(u => (
            <li key={u.id} className="flex items-center gap-2">
              <span className="font-mono">{u.id.slice(-6)}</span>
              <span className={u.role === "host" ? "text-green-700" : "text-gray-500"}>
                {u.role === "host" ? "Dungeon Master" : "Oyente"}
              </span>
              {u.name && (
                <span className="text-blue-700 font-semibold ml-2">{u.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {isHost && (
        <div className="text-xs text-gray-500 mt-2 italic">
          Usa los controles del reproductor inferior para controlar la música.
        </div>
      )}
    </div>
  )
}

export default Room
