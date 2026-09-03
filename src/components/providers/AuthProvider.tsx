'use client';

import React, { useEffect, useState } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { IPublicClientApplication } from '@azure/msal-browser';
import { initializeMsal, signIn } from '@/lib/auth/msalInstance';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setAuth, selectAuth } from '@/lib/redux/slices/authSlice';
import { AuthLoading } from '../common/AuthLoading';
import { sha256 } from '@/lib/utils/helpers';
import { setBossOMPage } from '@/lib/redux/slices/orderSlice';


const IS_TEST_ENV =
  !process.env.NEXT_PUBLIC_AUTHENTICATION_FLAG ||
  process.env.NEXT_PUBLIC_AUTHENTICATION_FLAG === 'false';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN;


function MsalAuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(selectAuth);
  const { accounts, inProgress } = useMsal();

  const isIframe =
    typeof window !== 'undefined' && window.self !== window.top;


  useEffect(() => {
    if (IS_TEST_ENV && !isAuthenticated) {
      dispatch(
        setAuth({
          user: {
            id: 'test-user',
            email: 'test@local.dev',
            name: 'Test User',
          },
          accessToken: '',
        })
      );
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (IS_TEST_ENV || !isIframe) return;
      window.parent.postMessage(
        { type: "CHILD_READY" },
        ALLOWED_ORIGIN || ""
      );
    

    const handleMessage = async (e: MessageEvent) => {
      try {
        if (ALLOWED_ORIGIN && e.origin !== ALLOWED_ORIGIN) return;

        const user = e.data?.user;
        if (!user) return;

        const hash = await sha256(
          user.id + user.email + user.timestamp + process.env.NEXT_PUBLIC_SECRET_KEY
        );

        if (hash.toLowerCase() !== user.secretKey.toLowerCase()) return;

        dispatch(
          setAuth({
            user: {
              id: user.id,
              email: user.email,
              name: user.id,
            },
            accessToken:
              sessionStorage.getItem('accessToken') || '',
          })
        );
        dispatch(setBossOMPage(e.data.page))
      } catch (err) {
        console.error('Iframe auth failed', err);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };

  }, []);


  useEffect(() => {
    if (IS_TEST_ENV || isIframe) return;

    if (!isAuthenticated && accounts.length > 0) {
      const account = accounts[0];

      dispatch(
        setAuth({
          user: {
            id: account.localAccountId,
            email: account.username,
            name: account.name || account.username,
          },
          accessToken:
            sessionStorage.getItem('accessToken') || '',
        })
      );
    }
  }, [accounts, isAuthenticated, dispatch, isIframe]);


  useEffect(() => {
    if (IS_TEST_ENV || isIframe) return;

    if (inProgress !== 'none') return;

    if (accounts.length === 0 && !isAuthenticated) {
      signIn();
    }
  }, [accounts.length, inProgress, isAuthenticated, isIframe]);


  if (IS_TEST_ENV) return <>{children}</>;

  if (inProgress !== 'none' || !isAuthenticated) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}


export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [msalInstance, setMsalInstance] =
    useState<IPublicClientApplication | null>(null);

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(selectAuth);

  const isIframe =
    typeof window !== 'undefined' && window.self !== window.top;



  useEffect(() => {
    if (!IS_TEST_ENV || isAuthenticated) return;

    dispatch(
      setAuth({
        user: {
          id: 'test-user',
          email: 'test@local.dev',
          name: 'Test User',
        },
        accessToken: '',
      })
    );
  }, [dispatch, isAuthenticated]);


  useEffect(() => {
    if (IS_TEST_ENV || isIframe) return;

    const init = async () => {
      const instance = await initializeMsal();
      setMsalInstance(instance);
    };

    init();
  }, [isIframe]);


  if (IS_TEST_ENV || isIframe) {
    return <MsalAuthGuard>{children}</MsalAuthGuard>;
  }

  if (!msalInstance) {
    return <AuthLoading />;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <MsalAuthGuard>{children}</MsalAuthGuard>
    </MsalProvider>
  );
}
