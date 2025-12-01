import React, { useEffect, useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import SongList from "./SongList"
import SongDetail from "./SongDetail"
import CategoryList from "./CategoryList"
import FavoritesList from "./FavoritesList"
import type { Song } from "../types"

const SongRoutes: React.FC<{ songs: Song[], favorites: Song[], toggleFavorite: (song: Song) => void, onSongClick?: (song: Song) => void }> = ({ songs, favorites, toggleFavorite, onSongClick }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [bgImage, setBgImage] = useState<string | null>(null)

  // Redirigir a /category/medieval si estamos en la raíz
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/category/medieval", { replace: true })
    }
  }, [location.pathname, navigate])

  // Actualizar fondo según la ruta
  useEffect(() => {
    const path = location.pathname
    let image = null

    if (path.startsWith("/category/")) {
      const category = path.split("/")[2]
      if (category) image = `/backgrounds/${category}.jpg`
    } else if (path === "/favoritos") {
      image = "/backgrounds/favorites.jpg"
    }

    setBgImage(image)
  }, [location.pathname])

  return (
    <div 
      className="max-w-6xl mx-auto bg-rpg-secondary/10 rounded-lg shadow-md p-4 md:p-6 mt-6 border-2 border-rpg-accent relative overflow-hidden bg-cover bg-center transition-all duration-500"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      {/* Overlay oscuro para mejorar legibilidad del texto sobre la imagen */}
      {bgImage && <div className="absolute inset-0 bg-black/70 z-0" />}

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<div className="text-rpg-light text-center">Cargando...</div>} />
          <Route path="/song/:id" element={<SongDetail songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
          <Route path="/category/:id" element={<CategoryList songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
          <Route path="/favoritos" element={<FavoritesList songs={favorites} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
        </Routes>
      </div>
    </div>
  )
}

export default SongRoutes
