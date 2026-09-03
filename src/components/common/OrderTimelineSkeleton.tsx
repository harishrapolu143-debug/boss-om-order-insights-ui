"use client";

type Props = {
  hideHeader?: boolean;
};

export default function OrderTimelinePageSkeleton({ hideHeader }: Props) {
  return (
    <div className="animate-pulse">
      {!hideHeader && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-64 rounded bg-gray-300" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-32 rounded-full bg-orange-100" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 px-8 bg-white">
            <div className="flex gap-14">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-300" />
                </div>
              ))}
            </div>

            <div className="h-8 w-28 rounded-full bg-orange-100" />
          </div>
        </div>
      )}

      {!hideHeader && (
        <div className="mb-6 flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-gray-300" />
          <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8 px-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300" />
              <div className="mt-1 w-px flex-1 bg-gray-300" />
            </div>

            <div className="flex-1 max-w-5xl">
              <div className="mb-2 h-3 w-48 rounded bg-gray-300" />

              <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
                <div className="h-4 w-3/4 rounded bg-gray-300" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
