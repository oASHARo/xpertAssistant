export default function CvFolderLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 rounded bg-gray-100" />
      <div className="mt-4 h-7 w-40 rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}