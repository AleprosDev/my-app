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
    <nav className="bg-purple-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">MusicApp</h1>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === tab.id ? "bg-purple-900 text-white" : "text-purple-100 hover:bg-purple-600"
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
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                activeTab === tab.id ? "bg-purple-900 text-white" : "text-purple-100 hover:bg-purple-600"
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
