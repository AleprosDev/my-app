export const sanitizeInput = (input: string | null): string => {
  if (!input) return ""
  // Eliminar etiquetas HTML y scripts básicos
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/["']/g, "") // Eliminar comillas para evitar romper atributos HTML
    .trim()
    .slice(0, 50) // Limitar longitud para evitar buffer overflows o UI rota
}

export const isValidRoomId = (roomId: string): boolean => {
  // Solo permitir letras, números, guiones y guiones bajos
  const regex = /^[a-zA-Z0-9-_]+$/
  return regex.test(roomId) && roomId.length <= 20
}
