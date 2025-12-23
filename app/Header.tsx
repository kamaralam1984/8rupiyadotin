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
    <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur transition-colors duration-300 dark:border-zinc-800 dark:bg-black/80">
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            8Rupiya
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-300 bg-white text-lg font-medium text-zinc-700 shadow-md transition-all duration-300 hover:scale-110 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-yellow-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-700"
            aria-label="Toggle dark mode"
          >
            <span className="transition-transform duration-300">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
          </button>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="flex items-center gap-3 text-sm font-medium">
            <a
              href="https://8rupiya.com/"
              className="rounded-full px-4 py-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              {isHindi ? "होम" : "Home"}
            </a>
            <a
              href="/education"
              className="rounded-full px-4 py-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              {isHindi ? "Education" : "Education"}
            </a>
            <a
              href="/admin"
              className="hidden rounded-full px-4 py-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 sm:inline-flex"
            >
              {isHindi ? "Admin" : "Admin"}
            </a>
          </div>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value as (typeof languages)[number]["code"],
              )
            }
            className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </nav>
    </header>
  );
}


