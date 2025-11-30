"use client"
import React from "react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || "Buscar..."}
    className="mb-6 p-2 border border-rpg-secondary bg-rpg-secondary/20 text-white rounded w-full max-w-md placeholder-rpg-light/50 focus:outline-none focus:ring-2 focus:ring-rpg-primary"
  />
)

export default SearchBar