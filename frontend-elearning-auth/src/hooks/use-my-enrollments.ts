// hooks/useEnrollments.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import EnrollmentService, { Enrollment, Course } from '@/services/enrollment-service';

// Query key for enrollments
const ENROLLMENTS_QUERY_KEY = 'user-enrollments';

/**
 * Custom hook to manage user course enrollments
 * 
 * @returns A comprehensive object with methods and data for working with enrollments
 */
export function useEnrollments() {
	const queryClient = useQueryClient();

	// Fetch enrollments data
	const {
		data: enrollments,
		isLoading,
		error,
		refetch
	} = useQuery({
		queryKey: [ENROLLMENTS_QUERY_KEY],
		queryFn: EnrollmentService.getMyEnrollments,
		staleTime: 5 * 60 * 1000, // 5 minutes cache
		refetchOnWindowFocus: true,
	});

	// Derived data and utilities
	const enrolledCourseIds = useMemo(() => {
		return enrollments?.map(enrollment => enrollment.course.id) || [];
	}, [enrollments]);

	/**
	 * Check if user is enrolled in a specific course
	 * @param courseId The course ID to check
	 * @returns Boolean indicating if the user is enrolled
	 */
	const isEnrolled = (courseId: number): boolean => {
		return enrolledCourseIds.includes(courseId);
	};

	/**
	 * Get enrollment details for a specific course
	 * @param courseId The course ID to get enrollment for
	 * @returns The enrollment object or undefined if not enrolled
	 */
	const getEnrollment = (courseId: number): Enrollment | undefined => {
		return enrollments?.find(enrollment => enrollment.course.id === courseId);
	};

	/**
	 * Get enrollment progress for a specific course
	 * @param courseId The course ID to get progress for
	 * @returns The progress percentage or 0 if not enrolled
	 */
	const getProgress = (courseId: number): number => {
		const enrollment = getEnrollment(courseId);
		return enrollment?.progressPercentage || 0;
	};

	/**
	 * Check if a course is completed
	 * @param courseId The course ID to check
	 * @returns Boolean indicating if the course is completed
	 */
	const isCompleted = (courseId: number): boolean => {
		const enrollment = getEnrollment(courseId);
		return !!enrollment?.completed;
	};

	/**
	 * Get courses that the user is currently learning (enrolled but not completed)
	 * @returns Array of courses that are in progress
	 */
	const getInProgressCourses = (): Course[] => {
		return enrollments
			?.filter(enrollment => !enrollment.completed)
			.map(enrollment => enrollment.course) || [];
	};

	/**
	 * Get courses that the user has completed
	 * @returns Array of completed courses
	 */
	const getCompletedCourses = (): Course[] => {
		return enrollments
			?.filter(enrollment => enrollment.completed)
			.map(enrollment => enrollment.course) || [];
	};

	/**
	 * Force refresh the enrollments data
	 */
	const refreshEnrollments = async (): Promise<void> => {
		await refetch();
	};

	/**
	 * Invalidate the enrollments cache to trigger a refresh
	 */
	const invalidateEnrollments = (): void => {
		queryClient.invalidateQueries({ queryKey: [ENROLLMENTS_QUERY_KEY] });
	};

	// Return all utilities and data
	return {
		// Raw data
		enrollments: enrollments || [],
		isLoading,
		error,

		// Derived data
		enrolledCourseIds,
		inProgressCourses: getInProgressCourses(),
		completedCourses: getCompletedCourses(),

		// Utility methods
		isEnrolled,
		getEnrollment,
		getProgress,
		isCompleted,
		getInProgressCourses,
		getCompletedCourses,
		refreshEnrollments,
		invalidateEnrollments,
	};
}

/**
 * Hook to check if a user is enrolled in a specific course
 * @param courseId The course ID to check
 * @returns Object with enrollment status and data
 */
export function useIsCourseEnrolled(courseId: number) {
	const {
		isEnrolled,
		getEnrollment,
		getProgress,
		isCompleted,
		isLoading,
		error
	} = useEnrollments();

	return {
		isEnrolled: isEnrolled(courseId),
		enrollment: getEnrollment(courseId),
		progress: getProgress(courseId),
		isCompleted: isCompleted(courseId),
		isLoading,
		error,
	};
}

export default useEnrollments;