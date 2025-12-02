import React, { useEffect, useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import SongList from "./SongList"
import SongDetail from "./SongDetail"
import CategoryList from "./CategoryList"
import FavoritesList from "./FavoritesList"
import type { Song } from "../types"

const SongRoutes: React.FC<{ 
  songs: Song[], 
  favorites: Song[], 
  toggleFavorite: (song: Song) => void, 
  onSongClick?: (song: Song) => void,
  currentSong?: Song | null,
  isPlaying?: boolean
}> = ({ songs, favorites, toggleFavorite, onSongClick, currentSong, isPlaying }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Redirigir a /category/medieval si estamos en la raíz
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/category/medieval", { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <Routes>
        <Route path="/" element={<div className="text-rpg-light text-center">Cargando...</div>} />
        <Route path="/song/:id" element={<SongDetail songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
        <Route path="/category/:id" element={<CategoryList songs={songs} favorites={favorites} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} currentSong={currentSong} isPlaying={isPlaying} />} />
        <Route path="/favoritos" element={<FavoritesList songs={favorites} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} currentSong={currentSong} isPlaying={isPlaying} />} />
      </Routes>
    </div>
  )
}

export default SongRoutes
