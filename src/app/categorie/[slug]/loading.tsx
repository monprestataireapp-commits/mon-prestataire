export default function CategoryLoading() {
  return (
    <div>
      <div className="skeleton h-48 sm:h-64" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="skeleton h-8 w-48 rounded-xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              <div className="skeleton h-52" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
