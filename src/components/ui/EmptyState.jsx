export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-main bg-bg-subtle/50 px-6 py-10 text-center ${className}`}
    >
      {Icon && (
        <div
          aria-hidden="true"
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-bg-surface text-text-secondary shadow-xs"
        >
          <Icon className="h-6 w-6" />
        </div>
      )}
      {title && (
        <h3 className="font-heading text-base font-semibold text-text-main">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
