import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, Package, Percent } from 'lucide-react';
import { safeString, safeImageUrl, safeArrayLength, formatPrice } from '@/lib/utils';

interface ComboCardProps {
	combo: any;
	index: number;
	dictionary: any;
	currentLocale: string;
}

const ComboCard = ({ combo, index, dictionary = {}, currentLocale }: ComboCardProps) => {
	const hasDiscount = combo.originalPrice && combo.discountPrice && combo.originalPrice > combo.discountPrice;
	// Ensure dictionary and combos exist to prevent errors
	const dict = dictionary || {};
	const comboDict = dict.combos || {};

	return (
		<div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-secondary/20 transform hover:-translate-y-2 relative h-full flex flex-col'>
			{/* Discount Badge */}
			{hasDiscount && (
				<div className='absolute top-4 left-4 z-10'>
					<div className='bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1'>
						<Percent className='w-3 h-3' />
						<span className='text-xs font-bold'>SALE</span>
					</div>
				</div>
			)}

			{/* Combo Image - Fixed Height */}
			<Link href={`/${currentLocale}/combos/${combo.id}`}>
				<div className='relative h-48 overflow-hidden cursor-pointer flex-shrink-0'>
					<Image
						src={safeImageUrl(combo.imageUrl || combo.thumbnailUrl, '/images/default-combo.jpg')}
						alt={safeString(combo.title, 'Combo Package')}
						fill
						className='object-cover group-hover:scale-110 transition-transform duration-500'
					/>

					{/* Overlay */}
					<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

					{/* Course Count Badge */}
					<div className='absolute top-4 right-4'>
						<div className='bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1'>
							<Package className='w-3 h-3 text-secondary' />
							<span className='text-secondary font-bold text-xs'>
								{combo.courseCount || safeArrayLength(combo.courses) || 3} Courses
							</span>
						</div>
					</div>

					{/* Quick Action Button */}
					<div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
						<div className='bg-white text-secondary p-2 rounded-full shadow-lg hover:bg-secondary hover:text-white transition-colors duration-200'>
							<Package className='w-5 h-5' />
						</div>
					</div>
				</div>
			</Link>

			{/* Combo Content - Flexible Height */}
			<div className='p-6 flex flex-col flex-grow'>
				{/* Combo Title - Fixed Height */}
				<Link href={`/${currentLocale}/combos/${combo.id}`}>
					<h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-secondary transition-colors duration-200 cursor-pointer min-h-[3.5rem] flex items-start'>
						{safeString(combo.title, 'Combo Package')}
					</h3>
				</Link>

				{/* Combo Description - Fixed Height */}
				<p className='text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed min-h-[4.5rem] flex items-start'>
					{safeString(
						combo.description,
						'Complete learning package with multiple courses designed for comprehensive skill development.'
					)}
				</p>

				{/* Combo Stats - Fixed Height */}
				<div className='flex items-center justify-between mb-6 text-sm text-gray-500 h-5'>
					<div className='flex items-center gap-1'>
						<Clock className='w-4 h-4' />
						<span>{safeString(combo.totalDuration, '40h')}</span>
					</div>

					<div className='flex items-center gap-1'>
						<Users className='w-4 h-4' />
						<span>{combo.enrolledCount || 0} students</span>
					</div>

					<div className='flex items-center gap-1'>
						<Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
						<span>{combo.rating || '4.9'}</span>
					</div>
				</div>

				{/* Included Courses Preview - Fixed Height */}
				<div className='mb-6 h-24 flex flex-col'>
					<h4 className='text-sm font-semibold text-gray-700 mb-3 flex-shrink-0'>Included Courses:</h4>
					<div className='flex-1 overflow-hidden'>
						{Array.isArray(combo.courses) && combo.courses.length > 0 ? (
							<div className='space-y-2'>
								{combo.courses.slice(0, 3).map((course: any, idx: number) => (
									<div key={idx} className='flex items-center gap-2 text-xs text-gray-600'>
										<div className='w-2 h-2 bg-secondary rounded-full flex-shrink-0'></div>
										<span className='line-clamp-1'>
											{safeString(course.title || course, `Course ${idx + 1}`)}
										</span>
									</div>
								))}
								{combo.courses.length > 3 && (
									<div className='text-xs text-gray-500 ml-4'>
										+{combo.courses.length - 3} more courses
									</div>
								)}
							</div>
						) : (
							<div className='space-y-2'>
								{[1, 2, 3].map((idx) => (
									<div key={idx} className='flex items-center gap-2 text-xs text-gray-400'>
										<div className='w-2 h-2 bg-gray-300 rounded-full flex-shrink-0'></div>
										<span className='line-clamp-1'>Course {idx}</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Pricing - Fixed Height */}
				<div className='mb-6 h-16 flex flex-col justify-center'>
					{combo.discountPrice > 0 ? (
						<div className='flex flex-col gap-1'>
							<div className='flex items-center gap-3'>
								<span className='text-2xl font-bold text-secondary'>
									{formatPrice(combo.discountPrice)}
								</span>
								{hasDiscount && (
									<span className='text-lg text-gray-400 line-through'>
										{formatPrice(combo.originalPrice)}
									</span>
								)}
							</div>
							{hasDiscount && (
								<p className='text-xs text-green-600 font-medium'>
									Tiết kiệm {formatPrice(combo.originalPrice - combo.discountPrice)} (
									{combo.discountPercentage}%)
								</p>
							)}
						</div>
					) : (
						<span className='text-2xl font-bold text-green-600'>Miễn phí</span>
					)}
				</div>

				{/* Action Buttons - Fixed at Bottom */}
				<div className='flex gap-3 mt-auto'>
					<Link href={`/${currentLocale}/combos/${combo.id}`} className='flex-1'>
						<Button
							className='w-full bg-gradient-to-r from-secondary to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'
							variant='secondary'
						>
							<span className='flex items-center justify-center gap-2'>
								{comboDict.buyNow || 'Buy Combo'}
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 7l5 5m0 0l-5 5m5-5H6'
									/>
								</svg>
							</span>
						</Button>
					</Link>

					<Link href={`/${currentLocale}/combos/${combo.id}`}>
						<Button
							className='px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-300'
							variant='ghost'
						>
							<span className='flex items-center gap-2'>
								{comboDict.viewDetails || 'Details'}
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 5l7 7-7 7'
									/>
								</svg>
							</span>
						</Button>
					</Link>
				</div>
			</div>

			{/* Bottom Accent */}
			<div className='h-1 bg-gradient-to-r from-secondary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
		</div>
	);
};

export default ComboCard;
