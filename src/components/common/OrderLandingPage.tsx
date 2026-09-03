'use client';

import Image from 'next/image';
import LogoYellow from '../../../public/assets/svg/logo.svg';

export default function OrderLandingPage() {

  return (
    <div className="flex pt-40 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        
        <Image
          src={LogoYellow}
          width={72}
          height={72}
          alt="App Logo"
          priority
        />

        <h1 className="mt-2 text-xl font-semibold text-gray-700">
          No Result Found
        </h1>

        <p className="max-w-sm text-sm text-gray-500">
          Enter the valid order number in the search bar above to continue.
        </p>
      </div>
    </div>
  );
}
