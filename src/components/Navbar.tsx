"use client"

import type React from "react"

type NavbarProps = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "rock", name: "Rock" },
    { id: "pop", name: "Pop" },
    { id: "jazz", name: "Jazz" },
    { id: "electronic", name: "Electrónica" },
  ]

  return (
    <nav className="bg-rpg-dark text-white shadow-md border-b-4 border-rpg-accent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-rpg-light">Bard's Tavern</h1>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-rpg-accent text-rpg-dark font-bold" : "text-rpg-light hover:bg-rpg-secondary hover:text-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden bg-rpg-dark">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                activeTab === tab.id ? "bg-rpg-accent text-rpg-dark" : "text-rpg-light hover:bg-rpg-secondary"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
