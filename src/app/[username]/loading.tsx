// src/app/[username]/loading.tsx
// Suspense用のローディングUI

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-0 px-0">
      <div className="w-full max-w-[450px] mx-auto aspect-[3/4] relative">
        {/* スケルトンUI */}
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

