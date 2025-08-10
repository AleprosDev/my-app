import React from "react"
import { Routes, Route } from "react-router-dom"
import SongList from "./SongList"
import SongDetail from "./SongDetail"
import CategoryList from "./CategoryList"
import FavoritesList from "./FavoritesList"
import type { Song } from "../types"
import CreateSongForm from "./CreateSongForm"

const SongRoutes: React.FC<{ songs: Song[], favorites: Song[], toggleFavorite: (song: Song) => void, onSongClick?: (song: Song) => void }> = ({ songs, favorites, toggleFavorite, onSongClick }) => (
  <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
    <Routes>
      <Route path="/" element={<SongList songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
      <Route path="/song/:id" element={<SongDetail songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
      <Route path="/category/:id" element={<CategoryList songs={songs} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
      <Route path="/favoritos" element={<FavoritesList songs={favorites} onToggleFavorite={toggleFavorite} onSongClick={onSongClick} />} />
      <Route path="/create-song" element={<CreateSongForm />} />
    </Routes>
  </div>
)

export default SongRoutes
