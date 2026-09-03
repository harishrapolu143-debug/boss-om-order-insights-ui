'use client';

import Image from 'next/image';
import { Home } from 'lucide-react';
import LogoGray from '../../public/assets/svg/logo.svg';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="relative  w-screen h-screen flex flex-col items-center justify-center gap-4 bg-white text-center">
      <Image src={LogoGray} width={80} height={80} alt="App Logo" priority />

      <h1 className="text-2xl font-semibold text-gray-700">
        Something went wrong
      </h1>

      <p className="text-gray-500 max-w-md">
        We&apos;re sorry for the inconvenience. Please try again.
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition"
      >
        <Home size={16} />
        Try Again
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="absolute bottom-6 max-w-2xl text-center">
          <summary className="cursor-pointer text-sm text-gray-600">
            Error details
          </summary>
          <pre className="mt-2 rounded bg-gray-100 p-4 text-xs text-red-600 overflow-auto max-h-60">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
