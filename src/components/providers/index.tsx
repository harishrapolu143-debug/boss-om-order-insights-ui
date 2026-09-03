
import React from 'react';
import StoreProvider from './StoreProvider';
import AuthProvider from './AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </StoreProvider>
  );
}
