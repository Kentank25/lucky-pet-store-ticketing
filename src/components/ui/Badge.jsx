const VARIANT_CLASSES = {
  neutral:
    "bg-bg-subtle text-text-secondary border-border-subtle",
  pending:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800/60",
  waiting:
    "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800/60",
  active:
    "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-200 dark:border-teal-800/60",
  payment:
    "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800/60",
  completed:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/60",
  cancelled:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800/60",
  grooming:
    "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:border-orange-800/60",
  klinik:
    "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-200 dark:border-teal-800/60",
};

const DOT_CLASSES = {
  neutral: "bg-slate-500 dark:bg-slate-400",
  pending: "bg-amber-600 dark:bg-amber-400",
  waiting: "bg-sky-600 dark:bg-sky-400",
  active: "bg-teal-600 dark:bg-teal-400",
  payment: "bg-purple-600 dark:bg-purple-400",
  completed: "bg-emerald-600 dark:bg-emerald-400",
  cancelled: "bg-red-600 dark:bg-red-400",
  grooming: "bg-orange-600 dark:bg-orange-400",
  klinik: "bg-teal-600 dark:bg-teal-400",
};

export default function Badge({
  variant = "neutral",
  dot = false,
  className = "",
  children,
  ...props
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral;
  const dotClasses = DOT_CLASSES[variant] || DOT_CLASSES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${variantClasses} ${className}`}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClasses}`}
        />
      )}
      {children}
    </span>
  );
}
