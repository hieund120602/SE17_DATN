'use client';

import { useQuery } from '@tanstack/react-query';

// Define the dictionary structure based on what's used in the component
interface CourseDictionary {
  common: {
    home: string;
    [key: string]: string;
  };
  courses: {
    pageTitle: string;
    instructor: string;
    lastUpdated: string;
    rating: string;
    reviews: string;
    students: string;
    bestSeller: string;
    off: string;
    duration: string;
    lessons: string;
    lessonsCount: string;
    level: string;
    access: string;
    fullLifetimeAccess: string;
    moneyBackGuarantee: string;
    courseContent: string;
    [key: string]: string;
  };
  [key: string]: any;
}

// Function to fetch the dictionary
async function fetchDictionary(lang: string): Promise<CourseDictionary> {
  const response = await fetch(`/api/dictionaries/${lang}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dictionary');
  }
  return response.json();
}

export function useDictionary(lang: string) {
  return useQuery<CourseDictionary>({
    queryKey: ['dictionary', lang],
    queryFn: () => fetchDictionary(lang),
    staleTime: Infinity, // Dictionary won't change during a session
    gcTime: Infinity, // Keep in cache for the entire session
  });
}