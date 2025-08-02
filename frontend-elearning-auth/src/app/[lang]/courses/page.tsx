'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
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

const CoursesPage = ({ dictionary, currentLocale }: { dictionary: any; currentLocale: string }) => {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const lang = params.lang as string;

	// States for filters
	const [searchTerm, setSearchTerm] = useState('');
	const [priceRange, setPriceRange] = useState([0, 5000000]);
	const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
	const [selectedSort, setSelectedSort] = useState('newest');
	const [showFilters, setShowFilters] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [page, setPage] = useState(0);

	// Fetch dictionary
	const { data: dict, isLoading: isDictLoading } = useQuery({
		queryKey: ['dictionary', lang],
		queryFn: async () => {
			const response = await fetch(`/api/dictionary?lang=${lang}`);
			if (!response.ok) {
				throw new Error('Failed to fetch dictionary');
			}
			return response.json();
		},
	});

	// Fetch levels for filter
	const { data: levels } = useQuery({
		queryKey: ['levels'],
		queryFn: async () => {
			try {
				const response = await fetch(`/api/levels`);
				if (!response.ok) {
					return [];
				}
				return response.json();
			} catch (error) {
				console.error('Error fetching levels:', error);
				return [];
			}
		},
	});

	// Fetch courses with filters
	const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
		queryKey: ['courses', page, selectedSort, searchTerm, selectedLevels, priceRange],
		queryFn: async () => {
			try {
				// In a real app, we would send these filters to the API
				// For now, we'll fetch all courses and filter them client-side
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

				return {
					...response,
					content: filteredCourses,
				};
			} catch (error) {
				console.error('Error fetching courses:', error);
				return { content: [], totalPages: 0, totalElements: 0 };
			}
		},
	});

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

		const url = `/${lang}/courses${params.toString() ? '?' + params.toString() : ''}`;
		window.history.replaceState({}, '', url);
	}, [searchTerm, selectedLevels, priceRange, selectedSort, page, lang]);

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
		return formatPrice(value, lang === 'jp' ? 'ja-JP' : 'vi-VN', lang === 'jp' ? 'JPY' : 'VND');
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

			// Add pages in range
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
	}, [page, totalPages]);

	return (
		<div className='bg-white'>
			<div className='sec-com'>
				{/* Hero Section */}
				<div className='relative py-16 overflow-hidden border-b border-gray-100'>
					{/* Background Pattern */}
					<div className='absolute inset-0 opacity-10'>
						<div
							className='absolute inset-0'
							style={{ backgroundImage: "url('/images/grid-pattern.svg')", backgroundSize: '20px' }}
						></div>
					</div>

					{/* Decorative Elements */}
					<div className='absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl'></div>
					<div className='absolute bottom-5 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl'></div>

					<div className='container-lg relative z-10'>
						<div className='max-w-3xl'>
							<h1 className='text-4xl md:text-5xl font-bold mb-6'>
								{dict?.courses?.pageTitle || 'Explore Our Courses'}
							</h1>
							<p className='text-xl text-gray-900 mb-8 leading-relaxed'>
								{dict?.courses?.pageDescription ||
									'Discover high-quality Japanese courses designed by top instructors to help you achieve fluency faster.'}
							</p>

							{/* Search Form */}
							<form onSubmit={handleSearch} className='flex w-full max-w-2xl'>
								<Input
									type='text'
									placeholder={dict?.courses?.searchPlaceholder || 'Search for courses...'}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='flex-1 rounded-r-none border-r-0 bg-white/90 text-gray-800 placeholder:text-gray-500 focus-visible:ring-primary'
								/>
								<Button
									type='submit'
									className='rounded-l-none bg-white text-primary hover:bg-white/90'
								>
									<Search className='h-5 w-5' />
								</Button>
							</form>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className='py-5'>
					<div className='container-lg'>
						<div className='flex flex-col md:flex-row gap-8'>
							{/* Filters - Mobile Toggle */}
							<div className='md:hidden mb-4'>
								<Button
									variant='superOutline'
									className='w-full flex justify-between items-center'
									onClick={() => setShowFilters(!showFilters)}
								>
									<div className='flex items-center'>
										<Filter className='h-5 w-5 mr-2' />
										{dict?.courses?.filters || 'Filters'}
									</div>
									{showFilters ? (
										<ChevronUp className='h-5 w-5' />
									) : (
										<ChevronDown className='h-5 w-5' />
									)}
								</Button>
							</div>

							{/* Filters Sidebar */}
							<div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-1/4 lg:w-1/5 space-y-6`}>
								<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
									<div className='flex justify-between items-center mb-4'>
										<h3 className='font-semibold text-lg text-gray-900'>
											{dict?.courses?.filters || 'Filters'}
										</h3>
										<Button
											variant='ghost'
											size='sm'
											onClick={clearFilters}
											className='text-gray-500 hover:text-primary h-auto py-1 px-2'
										>
											{dict?.courses?.clearAll || 'Clear All'}
										</Button>
									</div>

									{/* Price Range Filter */}
									<div className='mb-6 border-b border-gray-100 pb-6'>
										<h4 className='font-medium text-gray-900 mb-4'>
											{dict?.courses?.priceRange || 'Price Range'}
										</h4>
										<div className='px-2'>
											<Slider
												defaultValue={priceRange}
												min={0}
												max={5000000}
												step={100000}
												onValueChange={(value) => setPriceRange(value as [number, number])}
												className='mb-6'
											/>
											<div className='flex justify-between items-center text-sm'>
												<span>{formatPriceRange(priceRange[0])}</span>
												<span>{formatPriceRange(priceRange[1])}</span>
											</div>
										</div>
									</div>

									{/* Level Filter */}
									<div className='mb-6 border-b border-gray-100 pb-6'>
										<h4 className='font-medium text-gray-900 mb-4'>
											{dict?.courses?.level || 'Level'}
										</h4>
										<div className='space-y-3'>
											{isCoursesLoading ? (
												<div className='animate-pulse space-y-2'>
													{[1, 2, 3, 4].map((i) => (
														<div key={i} className='h-5 bg-gray-200 rounded w-3/4'></div>
													))}
												</div>
											) : (
												levels?.map((level: any) => (
													<div key={level.id} className='flex items-center'>
														<Checkbox
															id={`level-${level.id}`}
															checked={selectedLevels.includes(level.name)}
															onCheckedChange={() => toggleLevel(level.name)}
															className='text-primary border-gray-300'
														/>
														<label
															htmlFor={`level-${level.id}`}
															className='ml-2 text-sm font-medium text-gray-700 cursor-pointer'
														>
															{level.name}
														</label>
													</div>
												))
											)}
										</div>
									</div>

									{/* Active Filters */}
									{(selectedLevels.length > 0 ||
										searchTerm ||
										priceRange[0] > 0 ||
										priceRange[1] < 5000000) && (
											<div className='mb-6'>
												<h4 className='font-medium text-gray-900 mb-3'>
													{dict?.courses?.activeFilters || 'Active Filters'}
												</h4>
												<div className='flex flex-wrap gap-2'>
													{searchTerm && (
														<Badge
															variant='outline'
															className='flex items-center gap-1 px-3 py-1'
														>
															{searchTerm}
															<X
																className='h-3 w-3 cursor-pointer'
																onClick={() => setSearchTerm('')}
															/>
														</Badge>
													)}

													{selectedLevels.map((level) => (
														<Badge
															key={level}
															variant='outline'
															className='flex items-center gap-1 px-3 py-1'
														>
															{level}
															<X
																className='h-3 w-3 cursor-pointer'
																onClick={() => toggleLevel(level)}
															/>
														</Badge>
													))}

													{(priceRange[0] > 0 || priceRange[1] < 5000000) && (
														<Badge
															variant='outline'
															className='flex items-center gap-1 px-3 py-1'
														>
															{formatPriceRange(priceRange[0])} -{' '}
															{formatPriceRange(priceRange[1])}
															<X
																className='h-3 w-3 cursor-pointer'
																onClick={() => setPriceRange([0, 5000000])}
															/>
														</Badge>
													)}
												</div>
											</div>
										)}
								</div>
							</div>

							{/* Courses List */}
							<div className='flex-1'>
								{/* Sorting and View Controls */}
								<div className='bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center border border-gray-100'>
									<div className='flex items-center mb-4 sm:mb-0'>
										<span className='text-gray-600 mr-3 whitespace-nowrap'>
											{dict?.courses?.sortBy || 'Sort by:'}
										</span>
										<Select value={selectedSort} onValueChange={setSelectedSort}>
											<SelectTrigger className='w-[180px] bg-white border-gray-200'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='newest'>
													{dict?.courses?.newest || 'Newest'}
												</SelectItem>
												<SelectItem value='oldest'>
													{dict?.courses?.oldest || 'Oldest'}
												</SelectItem>
												<SelectItem value='price_low'>
													{dict?.courses?.priceLowToHigh || 'Price: Low to High'}
												</SelectItem>
												<SelectItem value='price_high'>
													{dict?.courses?.priceHighToLow || 'Price: High to Low'}
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className='flex items-center gap-3'>
										<span className='text-gray-600 text-sm'>
											{coursesData?.totalElements || 0}{' '}
											{dict?.courses?.coursesFound || 'courses found'}
										</span>
										<div className='border-l border-gray-200 h-6 mx-2'></div>
										<div className='flex items-center gap-2'>
											<Button
												variant={viewMode === 'grid' ? 'default' : 'superOutline'}
												size='icon'
												className='h-9 w-9'
												onClick={() => setViewMode('grid')}
											>
												<Grid3X3 className='h-4 w-4' />
											</Button>
											<Button
												variant={viewMode === 'list' ? 'default' : 'superOutline'}
												size='icon'
												className='h-9 w-9'
												onClick={() => setViewMode('list')}
											>
												<List className='h-4 w-4' />
											</Button>
										</div>
									</div>
								</div>

								{/* Courses Grid/List */}
								{isCoursesLoading ? (
									<div
										className={`grid ${viewMode === 'grid'
												? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
												: 'grid-cols-1'
											} gap-6`}
									>
										{[1, 2, 3, 4, 5, 6].map((i) => (
											<CourseSkeleton key={i} />
										))}
									</div>
								) : coursesData?.content?.length && coursesData?.content?.length > 0 ? (
									<div
										className={`grid ${viewMode === 'grid'
												? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
												: 'grid-cols-1'
											} gap-6`}
									>
										{coursesData.content.map((course: any, index: number) => (
											<CourseCard
												key={course.id}
												course={course}
												index={index}
												dictionary={dict}
												currentLocale={lang}
											/>
										))}
									</div>
								) : (
									<div className='flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100'>
										<div className='w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
											<svg
												className='w-16 h-16 text-gray-400'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={1.5}
													d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
												/>
											</svg>
										</div>
										<h3 className='text-2xl font-semibold text-gray-700 mb-3'>
											{dict?.courses?.noCourses || 'No courses found'}
										</h3>
										<p className='text-gray-500 text-center max-w-md leading-relaxed'>
											{dict?.courses?.noCoursesMessage ||
												'Try adjusting your filters or search term to find courses.'}
										</p>
										<Button variant='superOutline' className='mt-6' onClick={clearFilters}>
											{dict?.courses?.clearFilters || 'Clear Filters'}
										</Button>
									</div>
								)}

								{/* Pagination */}
								{totalPages > 1 && (
									<div className='flex justify-center mt-12'>
										<div className='flex items-center gap-2'>
											<Button
												variant='superOutline'
												size='icon'
												disabled={page === 0}
												onClick={() => setPage((p) => Math.max(0, p - 1))}
												className='h-9 w-9'
											>
												<svg
													className='h-4 w-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M15 19l-7-7 7-7'
													/>
												</svg>
											</Button>

											{pageNumbers.map((pageNum, i) =>
												pageNum < 0 ? (
													<span key={`ellipsis-${i}`} className='px-2'>
														...
													</span>
												) : (
													<Button
														key={pageNum}
														variant={page === pageNum ? 'default' : 'superOutline'}
														size='icon'
														onClick={() => setPage(pageNum)}
														className='h-9 w-9'
													>
														{pageNum + 1}
													</Button>
												)
											)}

											<Button
												variant='superOutline'
												size='icon'
												disabled={page === totalPages - 1}
												onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
												className='h-9 w-9'
											>
												<svg
													className='h-4 w-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M9 5l7 7-7 7'
													/>
												</svg>
											</Button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CoursesPage;
