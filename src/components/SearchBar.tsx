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
    className="mb-6 p-2 border rounded w-full max-w-md"
  />
)

export default SearchBar