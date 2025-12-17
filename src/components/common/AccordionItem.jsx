import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function AccordionItem({
  title,
  count,
  icon,
  isOpen,
  onToggle,
  colorClass = "indigo",
  children,
  headerExtras,
  subtitle,
}) {
  return (
    <div
      className={`glass-panel mb-4 transition-all duration-500 rounded-3xl overflow-hidden group hover:shadow-xl ${
        isOpen
          ? `shadow-lg shadow-${colorClass}-100/50 dark:shadow-none ring-1 ring-${colorClass}-500/20`
          : "hover:bg-white/40 dark:hover:bg-white/5"
      }`}
    >
      <div
        className="p-5 flex items-center justify-between cursor-pointer select-none transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-inner group-hover:scale-110 ${
              isOpen
                ? `bg-${colorClass}-500 text-white shadow-${colorClass}-200`
                : `bg-${colorClass}-50 text-${colorClass}-600 dark:bg-${colorClass}-900/20 dark:text-${colorClass}-400`
            }`}
          >
            {icon}
          </div>
          <div className="text-left">
            <h4
              className={`font-black text-lg transition-colors flex items-center gap-2 ${
                isOpen
                  ? "text-text-main"
                  : "text-text-secondary group-hover:text-text-main"
              }`}
            >
              {title}
              {count !== undefined && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border bg-${colorClass}-100 text-${colorClass}-600 dark:bg-${colorClass}-900/30 dark:text-${colorClass}-400 border-${colorClass}-200 dark:border-${colorClass}-800`}
                >
                  {count}
                </span>
              )}
            </h4>
            {subtitle && (
              <p className="text-xs text-text-secondary font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {headerExtras}
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/50 dark:bg-black/20 text-text-muted transform transition-transform duration-500 border border-white/10 ${
              isOpen
                ? `rotate-180 bg-white dark:bg-white/10 shadow-sm text-${colorClass}-500`
                : "group-hover:bg-white/80 dark:group-hover:bg-white/10"
            }`}
          >
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 border-t border-dashed border-border-subtle/50 mt-2">
            <div className="pt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
