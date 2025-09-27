import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/**
 * Combines multiple class names into a single string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safely render string values, avoiding object rendering errors
export function safeString(value: any, fallback: string = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (value && typeof value === 'object') {
    // If it's an object, try to get common properties
    return value.name || value.title || value.fullName || fallback;
  }
  return fallback;
}

// Safely get nested object properties
export function safeGet(obj: any, path: string, fallback: any = null): any {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
}

// Format duration in minutes to readable format - safe for SSR
export function formatDuration(minutes: number, dictionary?: any): string {
  if (!minutes || minutes <= 0) return '0m';

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${minutes}m`;
}

// Format price with currency - safe for SSR
export function formatPrice(price: number, locale: string = 'vi-VN', currency: string = 'VND'): string {
  if (!price || price <= 0) return 'Free';

  // Simple formatting to avoid SSR/client mismatch
  if (currency === 'VND') {
    return `${price.toLocaleString('vi-VN')} VND`;
  }

  if (currency === 'JPY') {
    return `¥${price.toLocaleString('ja-JP')}`;
  }

  // Fallback
  return `${price.toLocaleString()} ${currency}`;
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, discountPrice: number): number {
  if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

// Safely render array length
export function safeArrayLength(arr: any): number {
  return Array.isArray(arr) ? arr.length : 0;
}

// Get safe image URL
export function safeImageUrl(url: any, fallback: string = '/images/placeholder.jpg'): string {
  if (typeof url === 'string' && url.trim()) {
    return url;
  }
  return fallback;
}

/**
 * Formats a number as currency - SSR safe version
 */
export function formatCurrency(amount: number): string {
  return formatPrice(amount, 'vi-VN', 'VND');
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

// Generate animation delay class
export function getAnimationDelayClass(index: number, baseDelay: number = 100): string {
  const delay = index * baseDelay;

  // Map to available CSS classes
  if (delay <= 100) return 'animate-delay-100';
  if (delay <= 200) return 'animate-delay-200';
  if (delay <= 300) return 'animate-delay-300';
  if (delay <= 400) return 'animate-delay-400';
  if (delay <= 500) return 'animate-delay-500';
  if (delay <= 600) return 'animate-delay-600';
  if (delay <= 700) return 'animate-delay-700';
  if (delay <= 800) return 'animate-delay-800';
  if (delay <= 900) return 'animate-delay-900';
  if (delay <= 1000) return 'animate-delay-1000';
  if (delay <= 1500) return 'animate-delay-1500';
  return 'animate-delay-2000';
}