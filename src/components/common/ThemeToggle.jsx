import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-subtle p-2 text-text-secondary transition-colors hover:border-border-main hover:bg-bg-muted/60 hover:text-text-main cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${className}`}
      aria-label={isDark ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
    >
      {isDark ? (
        <MoonIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />
      ) : (
        <SunIcon className="h-5 w-5 text-primary" aria-hidden="true" />
      )}
    </button>
  );
}
