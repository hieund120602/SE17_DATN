'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Check if it's a removeChild error
		const isRemoveChildError =
			error.message.includes('removeChild') ||
			error.message.includes("Failed to execute 'removeChild' on 'Node'") ||
			error.message.includes('The node to be removed is not a child of this node');

		if (isRemoveChildError) {
			console.warn('DOM removeChild error caught and handled:', error.message);
			// For removeChild errors, just reset the error state after a short delay
			setTimeout(() => {
				this.setState({ hasError: false, error: undefined });
			}, 100);
			return;
		}

		// For other errors, log them
		console.error('Error caught by ErrorBoundary:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// Check if it's a removeChild error
			const isRemoveChildError =
				this.state.error?.message.includes('removeChild') ||
				this.state.error?.message.includes("Failed to execute 'removeChild' on 'Node'") ||
				this.state.error?.message.includes('The node to be removed is not a child of this node');

			if (isRemoveChildError) {
				// For removeChild errors, don't show error UI, just return children
				return this.props.children;
			}

			// For other errors, show fallback UI
			return (
				this.props.fallback || (
					<div className='p-4 border border-red-200 rounded-lg bg-red-50'>
						<h2 className='text-lg font-semibold text-red-800 mb-2'>Something went wrong</h2>
						<p className='text-red-600'>
							An error occurred while rendering this component. Please try refreshing the page.
						</p>
						<button
							onClick={() => this.setState({ hasError: false, error: undefined })}
							className='mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200'
						>
							Try again
						</button>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
