// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// You can add other global setup here if needed, for example:
// - Mocking global objects like `fetch` or `matchMedia`
// - Setting up a global store provider if you use Redux/Zustand/Context API extensively

// Example: Mock matchMedia
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: jest.fn(), // deprecated
//     removeListener: jest.fn(), // deprecated
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });

// Example: Mock next/router for components that use useRouter
// jest.mock('next/router', () => ({
//   useRouter() {
//     return {
//       route: '/',
//       pathname: '',
//       query: '',
//       asPath: '',
//       push: jest.fn(),
//       events: {
//         on: jest.fn(),
//         off: jest.fn()
//       },
//       beforePopState: jest.fn(() => null),
//       prefetch: jest.fn(() => null)
//     };
//   }
// }));

// Example: Mock next/navigation for App Router components (useRouter, usePathname, useSearchParams)
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     refresh: jest.fn(),
//     back: jest.fn(),
//     forward: jest.fn(),
//   }),
//   usePathname: () => '/',
//   useSearchParams: () => new URLSearchParams(),
//   // Se você precisar de outros hooks como redirect, notFound, etc., adicione-os aqui.
// }));
