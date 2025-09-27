'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import ClientOnly from '@/components/client-only';

// React Query Provider
function QueryProviders({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
						retry: false,
						refetchOnMount: false,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ClientOnly>
				<ReactQueryDevtools initialIsOpen={false} />
			</ClientOnly>
		</QueryClientProvider>
	);
}

// Global Error Handler Component
function GlobalErrorHandler({ children }: { children: ReactNode }) {
	useEffect(() => {
		// Handle unhandled DOM errors
		const handleError = (event: ErrorEvent) => {
			// Check if it's a removeChild error
			if (
				event.message &&
				(event.message.includes('removeChild') ||
					event.message.includes("Failed to execute 'removeChild' on 'Node'") ||
					event.message.includes('The node to be removed is not a child of this node'))
			) {
				console.warn('Global DOM removeChild error caught and suppressed:', event.message);
				event.preventDefault();
				return false;
			}
		};

		// Handle unhandled promise rejections
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			if (event.reason && typeof event.reason === 'object' && event.reason.message) {
				const message = event.reason.message;
				if (
					message.includes('removeChild') ||
					message.includes("Failed to execute 'removeChild' on 'Node'") ||
					message.includes('The node to be removed is not a child of this node')
				) {
					console.warn('Global Promise removeChild error caught and suppressed:', message);
					event.preventDefault();
					return false;
				}
			}
		};

		// Add event listeners
		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		// Cleanup
		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	}, []);

	return <>{children}</>;
}

// Combined Providers
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<QueryProviders>
			<GlobalErrorHandler>
				<AuthProvider>{children}</AuthProvider>
			</GlobalErrorHandler>
		</QueryProviders>
	);
}
