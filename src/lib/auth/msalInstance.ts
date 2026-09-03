import {
  AuthenticationResult,
  EventType,
  PublicClientApplication,
  AccountInfo,
} from '@azure/msal-browser';
import { msalConfig } from './msalConfig';

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMsal() {
  await msalInstance.initialize();

  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response && response.account) {
      msalInstance.setActiveAccount(response.account);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', response.accessToken);

        // Navigate to the page the user originally requested
        const intendedPath = sessionStorage.getItem('preLoginRedirectPath') || '/boss-order-insights';
        sessionStorage.removeItem('preLoginRedirectPath');
        window.location.replace(intendedPath);
      }
    }
  } catch (error) {
    console.error('Error handling redirect:', error);
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      msalInstance.setActiveAccount(account);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', payload.accessToken);
      }
    }

    if (event.eventType === EventType.LOGOUT_SUCCESS) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }
    }
  });

  return msalInstance;
}

export function getActiveAccount(): AccountInfo | null {
  return msalInstance.getActiveAccount();
}

export function signIn() {
  if (msalInstance.getAllAccounts().length > 0) return;

  // Save current path so we can restore it after login
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const validRoutes = ['/boss-order-insights', '/boss-watchtower'];
    const isValidRoute = validRoutes.some((r) => path.startsWith(r));
    sessionStorage.setItem('preLoginRedirectPath', isValidRoute ? path + window.location.search : '/boss-order-insights');
  }

  return msalInstance.loginRedirect({
    scopes: ['openid', 'profile', 'email', 'User.Read'],
  });
}


export function signOut() {
  const account = msalInstance.getActiveAccount();
  if (!account) return;

  return msalInstance.logoutRedirect({ account });
}

export async function getAccessToken(scopes: string[] = ['User.Read']) {
  const account = msalInstance.getActiveAccount();

  if (!account) {
    throw new Error('No active account');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes,
      account,
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', response.accessToken);
    }

    return response.accessToken;
  } catch (error) {
    console.error('Silent token acquisition failed, falling back to redirect:', error);

    try {
      await msalInstance.acquireTokenRedirect({ scopes, account });
      return '';
    } catch (redirectError) {
      console.error('Token acquisition failed:', redirectError);
      throw redirectError;
    }
  }
}