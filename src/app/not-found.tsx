'use client';

import Image from 'next/image';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LogoGray from '../../public/assets/svg/logo.svg';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 bg-white text-center">
      <Image
        src={LogoGray}
        width={80}
        height={80}
        alt="App Logo"
        priority
      />

      <h1 className="text-2xl font-semibold text-gray-700">
        Page Not Found
      </h1>

      <p className="text-gray-500 max-w-md">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <button
        onClick={() => router.push('/')}
        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition">
        <Home size={16} />
        Back to Home
      </button>
    </div>
  );
}
