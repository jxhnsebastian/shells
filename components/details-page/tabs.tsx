"use client"

interface MovieTabNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  tabs: string[]
}

export function MovieTabNavigation({ activeTab, setActiveTab, tabs }: MovieTabNavigationProps) {
  return (
    <div className="border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`py-4 px-1 relative whitespace-nowrap ${
                activeTab === tab ? "text-white font-medium" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

