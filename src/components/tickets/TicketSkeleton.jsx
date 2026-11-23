import Card from "../ui/Card";
import Skeleton from "../common/Skeleton";

export default function TicketSkeleton() {
  return (
    <Card padding="sm" className="mb-4 last:mb-0">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-14 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="space-y-2 border-l-2 border-border-subtle pl-3">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border-subtle pt-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}
