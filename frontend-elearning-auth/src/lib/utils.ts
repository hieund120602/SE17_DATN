import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/**
 * Combines multiple class names into a single string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDuration = (minutes: number, dictionary: any) => {
  if (minutes < 60) {
    return `${minutes} ${dictionary.courses.minutes}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${dictionary.courses.hours}`;
  }

  return `${hours} ${dictionary.courses.hours} ${remainingMinutes} ${dictionary.courses.minutes}`;
};

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string into a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'dd MMM yyyy');
}

/**
 * Truncates text to a specified length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculates percentage discount between original and discounted price
 */
export function calculateDiscountPercentage(originalPrice: number, discountPrice: number): number {
  if (originalPrice <= 0) return 0;
  const percentage = ((originalPrice - discountPrice) / originalPrice) * 100;
  return Math.round(percentage);
}

/**
 * Checks if a date is in the past
 */
export function isDatePast(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date < today;
}

/**
 * Checks if a date is in the future
 */
export function isDateFuture(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date > today;
}

/**
 * Creates a range of numbers from start to end
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}