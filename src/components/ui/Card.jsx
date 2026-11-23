const PADDING_CLASSES = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function Card({
  padding = "md",
  elevated = false,
  className = "",
  children,
  ...props
}) {
  const paddingClasses = PADDING_CLASSES[padding] ?? PADDING_CLASSES.md;
  const elevationClasses = elevated
    ? "shadow-md dark:shadow-black/30"
    : "shadow-sm";

  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-bg-surface ${elevationClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
