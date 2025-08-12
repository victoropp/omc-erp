import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '../styles/globals.css';

// Create a client instance
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 408 (timeout)
          if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 408) {
            return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export default function App({ Component, pageProps }: AppProps) {
  // Create a new QueryClient for each page load to ensure we don't
  // share client state between users in SSR scenarios
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'toast-glass',
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
            loading: {
              iconTheme: {
                primary: '#F59E0B',
                secondary: 'white',
              },
            },
          }}
        />
        
        {/* Main application */}
        <Component {...pageProps} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}