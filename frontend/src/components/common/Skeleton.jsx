/** Loading skeleton block. Compose multiple for skeleton screens. */
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-md ${className}`} />
);

/** A pre-composed card skeleton used while dashboard data loads. */
export const CardSkeleton = () => (
  <div className="card space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export default Skeleton;
