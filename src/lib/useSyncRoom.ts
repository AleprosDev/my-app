import { useEffect, useRef } from "react"
import { supabase } from "./supabaseClient"

export type SyncEvent = {
  action: "play" | "pause" | "seek" | "change_song"
  songId: string
  currentTime: number
  timestamp: number
}

export function useSyncRoom({
  roomId,
  onEvent,
}: {
  roomId: string
  onEvent: (event: SyncEvent) => void
}) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    // Unirse al canal broadcast de la sala
    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } },
    })
    channelRef.current = channel

    channel.on('broadcast', { event: 'sync' }, (payload) => {
      if (payload.payload) {
        onEvent(payload.payload as SyncEvent)
      }
    })
    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [roomId, onEvent])

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

  return { sendSyncEvent }
}
