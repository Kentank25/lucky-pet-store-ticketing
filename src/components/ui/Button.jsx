const VARIANT_CLASSES = {
  primary:
    "bg-[#0D9488] text-white hover:bg-[#0F766E] dark:bg-[#0D9488] dark:hover:bg-[#14B8A6] shadow-xs",
  klinik:
    "bg-[#0D9488] text-white hover:bg-[#0F766E] dark:bg-[#0D9488] dark:hover:bg-[#14B8A6] shadow-xs",
  grooming:
    "bg-[#EA580C] text-white hover:bg-[#C2410C] dark:bg-[#EA580C] dark:hover:bg-[#F97316] shadow-xs",
  danger:
    "bg-[#DC2626] text-white hover:bg-[#B91C1C] dark:bg-[#DC2626] dark:hover:bg-[#EF4444] shadow-xs",
  secondary:
    "bg-bg-surface text-text-main border border-border-subtle hover:bg-bg-subtle hover:border-border-main shadow-xs",
  ghost:
    "bg-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-main",
};

const SIZE_CLASSES = {
  sm: "min-h-10 px-3 py-1.5 text-xs gap-1.5",
  md: "min-h-10 px-4 py-2 text-sm gap-2",
  lg: "min-h-11 px-6 py-2.5 text-base gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 shrink-0 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
