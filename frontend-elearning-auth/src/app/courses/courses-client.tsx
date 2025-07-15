'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, ChevronDown, ChevronUp, Grid3X3, List } from 'lucide-react';
import CourseCard from '@/app/pages/home/course-card';
import CourseSkeleton from '@/app/pages/home/course-skeleton';
import CourseService from '@/services/course-service';
import { formatPrice } from '@/lib/utils';
import type { Locale } from '../../../i18n-config';

// Define Dictionary type inline since we don't have a separate file for it
export interface Dictionary {
  courses?: {
    title?: string;
    filters?: string;
    clearAll?: string;
    search?: string;
    searchPlaceholder?: string;
    priceRange?: string;
    level?: string;
    sortBy?: string;
    newest?: string;
    oldest?: string;
    priceLowToHigh?: string;
    priceHighToLow?: string;
    showing?: string;
    of?: string;
    courses?: string;
    noCoursesFound?: string;
    tryAdjusting?: string;
    clearFilters?: string;
    previous?: string;
    next?: string;
  };
  [key: string]: any;
}

interface CoursesPageProps {
  dictionary: Dictionary;
  currentLocale: Locale;
}

const CoursesPage = ({ dictionary, currentLocale }: CoursesPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [coursesData, setCoursesData] = useState<{
    content: any[];
    totalPages: number;
    totalElements: number;
  }>({ content: [], totalPages: 0, totalElements: 0 });
  const [levels, setLevels] = useState<any[]>([]);

  // Fetch levels for filter
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await fetch(`/api/levels`);
        if (response.ok) {
          const data = await response.json();
          setLevels(data);
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchLevels();
  }, []);

  // Fetch courses with filters
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        // In a real app, we would send these filters to the API
        const sortBy =
          selectedSort === 'price_low' ? 'price' : selectedSort === 'price_high' ? 'price' : 'createdAt';
        const direction =
          selectedSort === 'price_high'
            ? 'desc'
            : selectedSort === 'price_low'
              ? 'asc'
              : selectedSort === 'oldest'
                ? 'asc'
                : 'desc';

        const response = await CourseService.getPublicCourses(page, 12, sortBy, direction);

        // Client-side filtering (in a real app, this would be done by the API)
        let filteredCourses = response.content;

        if (searchTerm) {
          filteredCourses = filteredCourses.filter(
            (course) =>
              course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (selectedLevels.length > 0) {
          filteredCourses = filteredCourses.filter((course) => selectedLevels.includes(course.level.name));
        }

        filteredCourses = filteredCourses.filter(
          (course) => course.price >= priceRange[0] && course.price <= priceRange[1]
        );

        setCoursesData({
          ...response,
          content: filteredCourses,
        });
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCoursesData({ content: [], totalPages: 0, totalElements: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [page, selectedSort, searchTerm, selectedLevels, priceRange]);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedLevels.length > 0) params.set('levels', selectedLevels.join(','));
    if (priceRange[0] > 0 || priceRange[1] < 5000000) {
      params.set('minPrice', priceRange[0].toString());
      params.set('maxPrice', priceRange[1].toString());
    }
    if (selectedSort !== 'newest') params.set('sort', selectedSort);
    if (page > 0) params.set('page', page.toString());

    const url = `/courses${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', url);
  }, [searchTerm, selectedLevels, priceRange, selectedSort, page]);

  // Initialize filters from URL on first load
  useEffect(() => {
    const q = searchParams.get('q');
    const levels = searchParams.get('levels');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const pageParam = searchParams.get('page');

    if (q) setSearchTerm(q);
    if (levels) setSelectedLevels(levels.split(','));
    if (minPrice && maxPrice) setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    if (sort) setSelectedSort(sort);
    if (pageParam) setPage(parseInt(pageParam));
  }, [searchParams]);

  // Handle level selection
  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));
    setPage(0); // Reset to first page when changing filters
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 5000000]);
    setSelectedLevels([]);
    setSelectedSort('newest');
    setPage(0);
  };

  // Format price for display
  const formatPriceRange = (value: number) => {
    return formatPrice(value, currentLocale === 'jp' ? 'ja-JP' : 'vi-VN', currentLocale === 'jp' ? 'JPY' : 'VND');
  };

  // Pagination controls
  const totalPages = coursesData?.totalPages || 0;
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);

      // Calculate start and end of page range around current page
      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);

      // Adjust if we're near the beginning or end
      if (page <= 1) {
        end = Math.min(totalPages - 2, 3);
      } else if (page >= totalPages - 2) {
        start = Math.max(1, totalPages - 4);
      }

      // Add ellipsis if needed
      if (start > 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add pages in the middle
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 2) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always show last page
      pages.push(totalPages - 1);
    }

    return pages;
  }, [totalPages, page]);

  const t = dictionary.courses || {};

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t.title || 'Courses'}</h1>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'}`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
            <Button
              variant="superOutline"
              className="flex items-center gap-2 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Section */}
          <div
            className={`${showFilters ? 'block' : 'hidden'
              } md:block bg-white p-4 rounded-lg shadow border border-gray-200 md:sticky md:top-24 h-fit`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-xl">{t.filters || 'Filters'}</h2>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t.clearAll || 'Clear All'}
              </Button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-medium mb-2">{t.search || 'Search'}</h3>
                <form onSubmit={handleSearch} className="flex items-center">
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder || 'Search courses...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" className="ml-2">
                    <Search size={16} />
                  </Button>
                </form>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-2">{t.priceRange || 'Price Range'}</h3>
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={5000000}
                    step={100000}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm">{formatPriceRange(priceRange[0])}</div>
                    <div className="text-sm">{formatPriceRange(priceRange[1])}</div>
                  </div>
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="font-medium mb-2">{t.level || 'Level'}</h3>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <div key={level.id} className="flex items-center">
                      <Checkbox
                        id={`level-${level.id}`}
                        checked={selectedLevels.includes(level.name)}
                        onCheckedChange={() => toggleLevel(level.name)}
                      />
                      <label htmlFor={`level-${level.id}`} className="ml-2 text-sm font-medium">
                        {level.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-medium mb-2">{t.sortBy || 'Sort By'}</h3>
                <Select value={selectedSort} onValueChange={setSelectedSort}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t.newest || 'Newest'}</SelectItem>
                    <SelectItem value="oldest">{t.oldest || 'Oldest'}</SelectItem>
                    <SelectItem value="price_low">{t.priceLowToHigh || 'Price: Low to High'}</SelectItem>
                    <SelectItem value="price_high">{t.priceHighToLow || 'Price: High to Low'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Courses Grid/List */}
          <div className="md:col-span-3 space-y-6">
            {/* Results Count and Active Filters */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">
                  {t.showing || 'Showing'}{' '}
                  <span className="font-medium">{coursesData?.content?.length || 0}</span> {t.of || 'of'}{' '}
                  <span className="font-medium">{coursesData?.totalElements || 0}</span> {t.courses || 'courses'}
                </span>

                {/* Active Filters */}
                <div className="flex flex-wrap gap-2">
                  {selectedLevels.map((level) => (
                    <Badge key={level} variant="outline" className="flex items-center gap-1">
                      {level}
                      <X size={12} className="cursor-pointer" onClick={() => toggleLevel(level)} />
                    </Badge>
                  ))}
                  {(priceRange[0] > 0 || priceRange[1] < 5000000) && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {formatPriceRange(priceRange[0])} - {formatPriceRange(priceRange[1])}
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => setPriceRange([0, 5000000])}
                      />
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      "{searchTerm}"
                      <X size={12} className="cursor-pointer" onClick={() => setSearchTerm('')} />
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Course Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <CourseSkeleton key={index} />
                  ))}
              </div>
            ) : coursesData.content.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {coursesData.content.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    currentLocale={currentLocale}
                    index={index}
                    dictionary={dictionary}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 mb-6">
                  <Image
                    src="/images/empty-state.svg"
                    alt="No courses found"
                    width={96}
                    height={96}
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">{t.noCoursesFound || 'No courses found'}</h3>
                <p className="text-gray-500 mb-6">{t.tryAdjusting || 'Try adjusting your filters'}</p>
                <Button onClick={clearFilters}>{t.clearFilters || 'Clear Filters'}</Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="superOutline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    {t.previous || 'Previous'}
                  </Button>

                  {pageNumbers.map((pageNumber, index) => (
                    <React.Fragment key={index}>
                      {pageNumber === -1 || pageNumber === -2 ? (
                        <span className="px-3 py-2">...</span>
                      ) : (
                        <Button
                          variant={page === pageNumber ? 'default' : 'superOutline'}
                          size="sm"
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber + 1}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}

                  <Button
                    variant="superOutline"
                    size="sm"
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    {t.next || 'Next'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage; 