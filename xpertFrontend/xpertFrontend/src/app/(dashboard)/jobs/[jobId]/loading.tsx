export default function JobDetailLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18.75rem_1fr]">
      <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
        <div className="mx-auto h-28 w-28 rounded-full bg-gray-100" />
        <div className="mt-4 h-4 w-20 rounded bg-gray-100" />
        <div className="mt-2 h-5 w-32 rounded bg-gray-200" />
        <div className="mt-4 flex flex-wrap gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-gray-100" />
          ))}
        </div>
      </div>

      <div className="animate-pulse">
        <div className="h-6 w-56 rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}