import { useEffect, useRef, useState } from "react"
import { supabase } from "./supabaseClient"

export type SyncEvent = {
  action: "play" | "pause" | "seek" | "change_song" | "time_update" | "play_sfx" | "ambience_update"
  songId: string
  currentTime: number
  timestamp: number
  sfxId?: string
  ambienceId?: string
  volume?: number
  isPlaying?: boolean
  loop?: boolean
}

export type RoomUser = {
  id: string
  name: string
  role: "host" | "listener" | "spectator"
  // Estado del host para sincronización inicial
  hostState?: {
    songId: string
    isPlaying: boolean
    progress: number
    timestamp: number
  }
}

export function useSyncRoom({
  roomId,
  userId,
  name,
  role,
  onEvent,
  hostState, // Estado actual del host para compartir en presencia
}: {
  roomId: string
  userId: string
  name: string
  role: "host" | "listener" | "spectator"
  onEvent: (event: SyncEvent) => void
  hostState?: {
    songId: string
    isPlaying: boolean
    progress: number
  }
}) {
  const channelRef = useRef<any>(null)
  const [users, setUsers] = useState<RoomUser[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTING" | "SUBSCRIBED" | "ERROR" | "DISCONNECTED">("CONNECTING")
  const [retryCount, setRetryCount] = useState(0)
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mantener una referencia actualizada al callback de eventos para evitar closures obsoletos
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    setConnectionStatus('CONNECTING')

    // Unirse al canal único de la sala (broadcast + presence)
    const channel = supabase.channel(`room:${roomId}`, {
      config: { 
        broadcast: { self: false },
        presence: { key: userId }
      },
    })
    channelRef.current = channel

    // Escuchar eventos de sincronización
    channel.on('broadcast', { event: 'sync' }, (payload) => {
      if (payload.payload) {
        onEventRef.current(payload.payload as SyncEvent)
      }
    })

    // Escuchar cambios de presencia (usuarios entrando/saliendo)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const userList: RoomUser[] = []
      Object.values(state).forEach((arr: unknown) => {
        (arr as RoomUser[]).forEach((u: RoomUser) => userList.push(u))
      })
      setUsers(userList)
    })

    channel.subscribe(async (status) => {
      // Limpiar timeout de error si existe, ya que hemos recibido un nuevo estado
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = null
      }

      if (status === 'SUBSCRIBED') {
        setConnectionStatus('SUBSCRIBED')
        // Trackear mi presencia inicial
        const presencePayload: RoomUser = {
          id: userId,
          name,
          role,
          hostState: role === 'host' && hostState ? {
            ...hostState,
            timestamp: Date.now()
          } : undefined
        }
        await channel.track(presencePayload)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        // No mostrar error inmediatamente, dar un margen de gracia para reconexión automática
        console.warn(`Problema de conexión (${status}). Esperando recuperación...`)
        errorTimeoutRef.current = setTimeout(() => {
          setConnectionStatus('ERROR')
          
          // Auto-recuperación: Si seguimos online, forzar reinicio del canal
          if (navigator.onLine) {
            console.log("Forzando reinicio del canal...")
            setRetryCount(prev => prev + 1)
          }
        }, 5000) // 5 segundos de tolerancia
      } else if (status === 'CLOSED') {
        setConnectionStatus('DISCONNECTED')
      }
    })

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      channel.unsubscribe()
    }
  }, [roomId, userId, retryCount]) // Reiniciar si cambia la sala, usuario o forzamos retry

  // Actualizar presencia cuando cambian mis datos (rol, nombre, o estado del host)
  useEffect(() => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      const presencePayload: RoomUser = {
        id: userId,
        name,
        role,
        hostState: role === 'host' && hostState ? {
          ...hostState,
          timestamp: Date.now()
        } : undefined
      }
      channelRef.current.track(presencePayload)
    }
  }, [name, role, hostState?.songId, hostState?.isPlaying, hostState?.progress]) // Dependencias específicas para evitar updates excesivos

  // Función para emitir eventos a la sala
  function sendSyncEvent(event: SyncEvent) {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync',
        payload: event,
      })
    }
  }

  return { sendSyncEvent, users, connectionStatus }
}
