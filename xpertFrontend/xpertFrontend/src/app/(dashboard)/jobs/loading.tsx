export default function JobDashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 rounded bg-gray-200" />

      <div className="mt-4 flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-100" />
        <div className="h-10 w-24 rounded-lg bg-gray-200" />
      </div>

      <div className="mt-4 h-4 w-48 rounded bg-gray-100" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-56 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}