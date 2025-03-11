import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Home,
  Search,
} from "lucide-react";
import Link from "next/link";

export function MovieHeader() {
  return (
    <header className="relative z-10 p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button className="p-1 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <button className="p-1 rounded-full hover:bg-white/10">
          <ArrowRight size={20} />
        </button>
        <Link href="/" className="p-1 rounded-full hover:bg-white/10">
          <Home size={20} />
        </Link>

        <div className="flex items-center text-sm text-gray-300">
          <Link href="/movies" className="hover:text-white">
            Movies
          </Link>
          <ChevronRight size={16} />
          <Link href="/movies/anora" className="hover:text-white">
            Anora
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-400">Overview</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-2 bg-gray-800/60 rounded-full px-4 py-1.5 text-sm">
          <Search size={16} />
          <span>Quick Search</span>
          <span className="text-xs border border-gray-500 px-1 rounded">
            ⌘K
          </span>
        </button>
        <button className="p-1 rounded-full hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-layout-grid"
          >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

interface SectionHeaderProps {
  title: string;
  setTab?: React.Dispatch<React.SetStateAction<string>>;
}

export function SectionHeader({ title, setTab }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="w-1 h-6 bg-blue-500 mr-3"></div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {setTab && (
        <span
          onClick={() => {
            setTab(title);
          }}
          className="text-sm text-gray-400 hover:text-white cursor-pointer"
        >
          more
        </span>
      )}
    </div>
  );
}
