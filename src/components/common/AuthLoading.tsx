"use client";

export function AuthLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="w-64 space-y-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}