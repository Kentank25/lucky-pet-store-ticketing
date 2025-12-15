import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-all duration-300 ${
        theme === "dark"
          ? "bg-slate-800 text-yellow-400 hover:bg-slate-700 hover:text-yellow-300"
          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
      } ${className}`}
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );
}
