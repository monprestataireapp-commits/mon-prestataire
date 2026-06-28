export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="skeleton h-5 w-32 rounded-lg mb-6" />
      <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden mb-6">
        <div className="skeleton h-48 sm:h-64 w-full" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end gap-4">
            <div className="skeleton w-24 h-24 rounded-2xl shrink-0" />
            <div className="flex-1 pt-14 space-y-2">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-8 w-64 rounded" />
              <div className="skeleton h-4 w-48 rounded" />
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-8 w-24 rounded-full" />)}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
