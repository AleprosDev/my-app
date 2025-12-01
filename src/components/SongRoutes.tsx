import React, { useEffect } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import SongList from "./SongList"
import SongDetail from "./SongDetail"
import CategoryList from "./CategoryList"
import FavoritesList from "./FavoritesList"
import type { Song } from "../types"

const SongRoutes: React.FC<{ songs: Song[], favorites: Song[], toggleFavorite: (song: Song) => void, onSongClick?: (song: Song) => void }> = ({ songs, favorites, toggleFavorite, onSongClick }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Redirigir a /category/medieval si estamos en la raíz
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/category/medieval", { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="max-w-6xl mx-auto bg-rpg-secondary/10 rounded-lg shadow-md p-6 mt-6 border-2 border-rpg-accent">
      <Routes>
        <Route path="/" element={<div className="text-rpg-light text-center">Cargando...</div>} />
        <Route path="/song/:id" element={<SongDetail songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
        <Route path="/category/:id" element={<CategoryList songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
        <Route path="/favoritos" element={<FavoritesList songs={favorites} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
      </Routes>
    </div>
  )
}

export default SongRoutes
