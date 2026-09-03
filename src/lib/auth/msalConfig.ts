// import { Configuration, LogLevel } from '@azure/msal-browser';

// // MSAL configuration
// export const msalConfig: Configuration = {
//   auth: {
//     clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || 'YOUR_CLIENT_ID',
//     authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AUTH_TENANT_ID || 'YOUR_TENANT_ID'}`,
//     redirectUri: process.env.NEXT_PUBLIC_BASE_URL + 'boss-order-insights',
//     navigateToLoginRequestUrl: false,
//   },
//   cache: {
//     cacheLocation: 'sessionStorage',
//     storeAuthStateInCookie: false,
//   },
//   system: {
//     loggerOptions: {
//       loggerCallback: (level, message, containsPii) => {
//         if (containsPii) return;
//         switch (level) {
//           case LogLevel.Error:
//             console.error(message);
//             return;
//           case LogLevel.Info:
//             console.info(message);
//             return;
//           case LogLevel.Verbose:
//             console.debug(message);
//             return;
//           case LogLevel.Warning:
//             console.warn(message);
//             return;
//         }
//       },
//       logLevel: LogLevel.Warning,
//     },
//     windowHashTimeout: 60000,
//     iframeHashTimeout: 6000,
//     loadFrameTimeout: 0,
//   },
// };

import { Configuration, LogLevel } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || 'YOUR_CLIENT_ID',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AUTH_TENANT_ID || 'YOUR_TENANT_ID'}`,
   redirectUri: typeof window !== 'undefined' ? window.location.href : '/',
    // redirectUri: process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin + '/' : '/'),
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      logLevel: LogLevel.Warning,
    },
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
  },
};