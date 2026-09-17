export default function NewJobLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-32 rounded bg-gray-200" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="mt-4 h-32 rounded-lg bg-gray-100" />
    </div>
  );
}