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
  const [role, setRole] = useState(isHost ? "host" : "listener")
  const [users, setUsers] = useState<RoomUser[]>([])
  const [name, setName] = useState(() => localStorage.getItem("room_user_name") || "")

  // Guardar el nombre en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("room_user_name", name)
  }, [name])

  // Presencia en tiempo real usando Supabase Realtime
  useEffect(() => {
    const channel = supabase.channel(`room-presence:${roomId}`, {
      config: { presence: { key: "user" } }
    })
    const userId = `${Math.random().toString(36).slice(2)}-${Date.now()}`
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
    setIsHost(role === "host")
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded shadow-md">
      <form onSubmit={handleJoin} className="flex gap-2 items-center">
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
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="host">Dungeon Master</option>
          <option value="listener">Oyente</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Entrar</button>
      </form>
      <div className="text-gray-700">Sala actual: <span className="font-mono">{roomId}</span></div>
      <div className="text-gray-700">Rol: <span className="font-mono">{isHost ? "Dungeon Master" : "Oyente"}</span></div>
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
        <div className="flex gap-2 mt-2">
          {!isPlaying && (
            <button
              onClick={onPlay}
              className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
            >
              Reproducir
            </button>
          )}
          {isPlaying && (
            <button
              onClick={onPause}
              className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
            >
              Pausar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Room
