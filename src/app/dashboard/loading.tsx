export default function Loading() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-9 w-28 rounded-xl" />
          <div className="skeleton h-9 w-24 rounded-xl" />
        </div>
      </div>
      <div className="skeleton h-20 rounded-2xl mb-6" />
      <div className="skeleton h-16 rounded-2xl mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-48 rounded-2xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    </div>
  )
}
