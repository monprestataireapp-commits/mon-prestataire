export default function RechercheLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="skeleton h-8 w-48 rounded-xl mb-6" />

      <div className="flex gap-2 mb-6 overflow-x-hidden">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-10 w-28 rounded-xl shrink-0" />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="skeleton h-52" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
