import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse-slow">
            <span className="text-4xl">📚</span>
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '-1s' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-2 h-2 rounded-full bg-indigo-400" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oriental Academy</h2>
        <p className="text-gray-500 text-sm mb-6">Yuklanmoqda...</p>

        {/* Progress bar */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-shimmer"
                 style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Components for page loading
export function CardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-2 bg-gray-200 rounded w-full" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="stats-card animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
        </div>
      ))}
    </div>
  );
}
