'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AuthService, { LoginParams, RegisterParams, User, AuthResponse } from '@/lib/auth-service';

// Auth context type definition
interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (params: LoginParams) => Promise<AuthResponse>;
	register: (params: RegisterParams) => Promise<AuthResponse>;
	logout: () => void;
	refetchUser: () => Promise<User | null>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const queryClient = useQueryClient();

	// Query to get current user
	const {
		data: user,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['currentUser'],
		queryFn: () => AuthService.getCurrentUser(),
		// Don't refetch on mount if we already have the data
		staleTime: Infinity,
	});

	// Function to manually refetch user data
	const refetchUser = async (): Promise<User | null> => {
		try {
			const result = await refetch();
			return result.data || null;
		} catch (error) {
			console.error('Error refetching user data:', error);
			return null;
		}
	};

	// Login mutation
	const loginMutation = useMutation({
		mutationFn: (params: LoginParams) => AuthService.login(params),
		onSuccess: (data) => {
			// Update the user in the cache
			queryClient.setQueryData(['currentUser'], data.user);
		},
	});

	// Register mutation
	const registerMutation = useMutation({
		mutationFn: (params: RegisterParams) => AuthService.register(params),
		onSuccess: (data) => {
			// Update the user in the cache
			queryClient.setQueryData(['currentUser'], data.user);
		},
	});

	// Logout function
	const logout = () => {
		AuthService.logout();
		// Clear the user from the cache
		queryClient.setQueryData(['currentUser'], null);
		// Invalidate all queries to refetch data after logout
		queryClient.invalidateQueries();
		router.push('/login');
	};

	// The value provided to the context consumers
	const contextValue: AuthContextType = {
		user: user || null,
		isLoading,
		isAuthenticated: !isError && !!user,
		login: loginMutation.mutateAsync,
		register: registerMutation.mutateAsync,
		logout,
		refetchUser,
	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
