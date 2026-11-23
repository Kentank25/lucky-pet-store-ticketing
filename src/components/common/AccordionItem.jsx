import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useId } from "react";

export default function AccordionItem({
  title,
  count,
  icon,
  isOpen,
  onToggle,
  colorClass = "teal",
  children,
  headerExtras,
  subtitle,
}) {
  const panelId = useId();
  const isGrooming = colorClass === "amber" || colorClass === "orange" || colorClass === "grooming";

  return (
    <div className="min-w-0 rounded-2xl border border-border-subtle bg-bg-surface shadow-xs">
      <div className="flex flex-wrap items-center gap-x-3 px-3 py-2 sm:px-4">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-11 min-w-0 flex-[1_1_12rem] items-center gap-2 rounded-xl text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:gap-3"
        >
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isGrooming
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                : "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
            }`}
          >
            {icon}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="flex flex-wrap items-center gap-2 font-heading text-base font-bold text-text-main sm:text-lg">
              {title}
              {count !== undefined && (
                <span className="rounded-full border border-border-subtle bg-bg-subtle px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary">
                  {count}
                </span>
              )}
            </span>
            {subtitle && (
              <span className="mt-0.5 block text-xs font-medium text-text-secondary">
                {subtitle}
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary motion-safe:transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <ChevronDownIcon className="h-5 w-5" />
          </span>
        </button>
        {headerExtras}
      </div>

      <div
        id={panelId}
        hidden={!isOpen}
        className="border-t border-border-subtle px-3 py-3 sm:p-4"
      >
        {isOpen && children}
      </div>
    </div>
  );
}
