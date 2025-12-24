"use client";

import { useAppContext } from "./Providers";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
] as const;

export function Header() {
  const { theme, toggleTheme, language, setLanguage } = useAppContext();
  const isHindi = language === "hi";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-xl transition-colors duration-300 dark:border-amber-500/20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        {/* Logo on Left */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
            8Rupiya
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <a
            href="/shop-directory"
            className="rounded-full border border-amber-500/30 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-amber-400 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/60 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-amber-500/20 md:px-4 md:text-sm"
          >
            {isHindi ? "खोज निर्देशिका" : "Search Directory"}
          </a>
          <a
            href="/education"
            className="rounded-full border border-amber-500/30 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-amber-400 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/60 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-amber-500/20 md:px-4 md:text-sm"
          >
            {isHindi ? "शिक्षा" : "Education"}
          </a>
        </div>

        {/* Icons on Right */}
        <div className="flex items-center gap-3">
          {/* Location Icon */}
          <button
            type="button"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-zinc-800/50 text-amber-400 transition-all duration-300 hover:border-amber-500/60 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-amber-500/20"
            aria-label="Location"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Search Icon (Mobile) */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-zinc-800/50 text-amber-400 transition-all duration-300 hover:border-amber-500/60 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-amber-500/20 md:hidden"
            aria-label="Search"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Profile Icon */}
          <button
            type="button"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-zinc-800/50 text-amber-400 transition-all duration-300 hover:border-amber-500/60 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-amber-500/20"
            aria-label="Profile"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-zinc-800/50 text-amber-400 transition-all duration-300 hover:border-amber-500/60 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-amber-500/20"
            aria-label="Toggle dark mode"
          >
            <span className="text-lg transition-transform duration-300 hover:scale-110">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}


