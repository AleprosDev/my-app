"use client"

import type React from "react"

const Navbar: React.FC = () => {
  return (
    <nav className="bg-rpg-dark/90 backdrop-blur-md text-white border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-3">
            <img src="/icon_250.png" alt="Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
            <h1 className="text-2xl font-bold text-white tracking-wider" style={{ fontFamily: "'Cinzel Decorative', cursive" }}>
              Laud <span className="text-rpg-accent">Infinito</span>
            </h1>
          </div>
          
          {/* Placeholder for future user menu or settings */}
          <div className="flex items-center gap-4">
            {/* Add user avatar or settings here later */}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
