export default function CvsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-32 rounded bg-gray-200" />

      <div className="mt-4 flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-100" />
        <div className="h-10 w-24 rounded-lg bg-gray-100" />
        <div className="h-10 w-28 rounded-lg bg-gray-200" />
      </div>

      <div className="mt-6 h-4 w-24 rounded bg-gray-100" />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100" />
        ))}
      </div>

      <div className="mt-6 h-4 w-16 rounded bg-gray-100" />
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}