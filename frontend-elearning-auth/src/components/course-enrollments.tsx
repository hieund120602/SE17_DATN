'use client';

import { useMyEnrollments } from '@/hooks/use-my-enrollments';

export default function CourseEnrollments() {
	const { data: enrollments, isLoading, error } = useMyEnrollments();

	if (isLoading) return <div>Loading enrollments...</div>;
	if (error) return <div>Error loading enrollments</div>;

	return <pre>{JSON.stringify(enrollments, null, 2)}</pre>;
}
