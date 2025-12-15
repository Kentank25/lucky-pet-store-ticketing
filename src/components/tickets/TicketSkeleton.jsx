import Skeleton from "../common/Skeleton";

export default function TicketSkeleton() {
  return (
    <div className="p-6 bg-bg-surface rounded-3xl shadow-lg border border-border-subtle mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Title & Badge */}
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 mt-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Action Buttons Placeholder */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      {/* Footer / QR Button */}
      <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}
