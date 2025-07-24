import { getDictionary } from '../../../lib/dictionary';
import type { Locale } from '../../../../i18n-config';
import { API_BASE_URL } from '../../../lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, Star, Package, Percent, BookOpen, ShoppingCart } from 'lucide-react';
import { safeString, safeImageUrl, safeArrayLength, formatPrice } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PageProps {
	params: {
		lang: Locale;
	};
}

async function getCombos() {
	try {
		const response = await fetch(`${API_BASE_URL}/combos?page=0&size=50&sortBy=createdAt&direction=desc`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch combos: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching combos:', error);
		return { content: [], totalElements: 0 };
	}
}

export default async function CombosPage({ params: { lang } }: PageProps) {
	const dictionary = await getDictionary(lang);
	const combosResponse = await getCombos();
	const combos = combosResponse.content || [];

	// Ensure dictionary exists to prevent errors
	const dict = dictionary || {};
	const comboDict = dict.combos || {};
	const courseDict = dict.courses || {};
	const commonDict = dict.common || {};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header Section */}
			<div className='bg-gradient-to-r from-secondary/10 to-primary/5 py-16'>
				<div className='container mx-auto px-4 text-center'>
					<div className='max-w-3xl mx-auto'>
						<div className='inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-secondary mb-6'>
							<Package className='w-4 h-4' />
							{comboDict.comboPackages || 'Gói combo'}
						</div>
						<h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
							{comboDict.title || 'Các gói combo'}
						</h1>
						<p className='text-xl text-gray-600 leading-relaxed'>
							{comboDict.description ||
								'Tiết kiệm chi phí với các gói combo khóa học tiếng Nhật được thiết kế đặc biệt'}
						</p>
					</div>
				</div>
			</div>

			{/* Combos Grid */}
			<div className='container mx-auto px-4 py-16'>
				{combos.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{combos.map((combo: any) => {
							const hasDiscount =
								combo.originalPrice && combo.discountPrice && combo.originalPrice > combo.discountPrice;
							const savings = hasDiscount ? combo.originalPrice - combo.discountPrice : 0;
							const savingsPercentage = hasDiscount
								? Math.round((savings / combo.originalPrice) * 100)
								: 0;

							return (
								<Card
									key={combo.id}
									className='overflow-hidden hover:shadow-xl transition-all duration-300 group'
								>
									{/* Combo Image */}
									<div className='relative aspect-video overflow-hidden'>
										<Image
											src={safeImageUrl(combo.thumbnailUrl, '/images/default-combo.jpg')}
											alt={safeString(combo.title, 'Combo Package')}
											fill
											className='object-cover group-hover:scale-105 transition-transform duration-300'
										/>
										{hasDiscount && (
											<div className='absolute top-4 left-4'>
												<div className='bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1'>
													<Percent className='w-3 h-3' />
													{savingsPercentage}% {comboDict.off || 'giảm'}
												</div>
											</div>
										)}
										<div className='absolute top-4 right-4'>
											<Badge variant='secondary' className='bg-white/90 text-secondary'>
												<Package className='w-3 h-3 mr-1' />
												{comboDict.comboLabel || 'Combo'}
											</Badge>
										</div>
									</div>

									<CardContent className='p-6'>
										{/* Title and Description */}
										<div className='mb-4'>
											<h3 className='text-xl font-bold text-gray-900 mb-2 line-clamp-2'>
												{safeString(combo.title, 'Combo Package')}
											</h3>
											<p className='text-gray-600 text-sm line-clamp-3'>
												{safeString(
													combo.description,
													'Complete learning package with multiple courses.'
												)}
											</p>
										</div>

										{/* Stats */}
										<div className='flex items-center gap-4 mb-4 text-sm text-gray-500'>
											<div className='flex items-center gap-1'>
												<BookOpen className='w-4 h-4' />
												<span>
													{combo.courseCount || safeArrayLength(combo.courses) || 0}{' '}
													{comboDict.includedCourses || 'khóa học'}
												</span>
											</div>
											<div className='flex items-center gap-1'>
												<Clock className='w-4 h-4' />
												<span>{combo.totalDuration || '40h'}</span>
											</div>
											<div className='flex items-center gap-1'>
												<Users className='w-4 h-4' />
												<span>{combo.enrolledCount || 0}</span>
											</div>
										</div>

										{/* Rating */}
										<div className='flex items-center gap-2 mb-4'>
											<div className='flex items-center gap-1'>
												<Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
												<span className='text-sm font-medium'>{combo.rating || '4.9'}</span>
											</div>
											<span className='text-sm text-gray-500'>
												({combo.reviewCount || 0} {courseDict.reviews || 'đánh giá'})
											</span>
										</div>

										{/* Pricing */}
										<div className='mb-6'>
											<div className='flex items-end gap-2 mb-1'>
												<span className='text-2xl font-bold text-secondary'>
													{formatPrice(combo.discountPrice || combo.price || 0)}
												</span>
												{hasDiscount && (
													<span className='text-lg text-gray-400 line-through'>
														{formatPrice(combo.originalPrice)}
													</span>
												)}
											</div>
											{hasDiscount && (
												<p className='text-sm text-green-600 font-medium'>
													{comboDict.savingsLabel || 'Tiết kiệm'} {formatPrice(savings)}
												</p>
											)}
										</div>

										{/* Buttons */}
										<div className='space-y-2'>
											<Link href={`/${lang}/combos/${combo.id}/purchase`} className='block'>
												<Button className='w-full bg-gradient-to-r from-secondary to-secondary-600 hover:from-secondary-600 hover:to-secondary-700'>
													<ShoppingCart className='w-4 h-4 mr-2' />
													{comboDict.buyNow || 'Mua ngay'}
												</Button>
											</Link>
											<Link href={`/${lang}/combos/${combo.id}`} className='block'>
												<Button variant='superOutline' className='w-full'>
													{comboDict.viewDetails || 'Xem chi tiết'}
												</Button>
											</Link>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				) : (
					// Empty State
					<div className='text-center py-20'>
						<div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
							<Package className='w-12 h-12 text-gray-400' />
						</div>
						<h2 className='text-2xl font-bold text-gray-800 mb-3'>
							{comboDict.noCombos || 'Chưa có gói combo nào'}
						</h2>
						<p className='text-gray-600 max-w-md mx-auto mb-8'>
							{comboDict.noCombosMessage || 'Hiện tại chưa có gói combo nào. Vui lòng quay lại sau.'}
						</p>
						<Link href={`/${lang}/courses`}>
							<Button className='bg-primary hover:bg-primary/90'>
								{courseDict.viewAllCourses || 'Xem các khóa học'}
							</Button>
						</Link>
					</div>
				)}
			</div>

			{/* CTA Section */}
			<div className='bg-gradient-to-r from-secondary to-secondary-600 py-16'>
				<div className='container mx-auto px-4 text-center'>
					<div className='max-w-2xl mx-auto'>
						<h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
							{lang === 'vi'
								? 'Bắt đầu hành trình học tiếng Nhật ngay hôm nay!'
								: '今日から日本語学習の旅を始めましょう！'}
						</h2>
						<p className='text-white/90 text-lg mb-8'>
							{lang === 'vi'
								? 'Chọn gói combo phù hợp với bạn và tiết kiệm chi phí học tập'
								: 'あなたに適したパッケージを選んで学習費用を節約しましょう'}
						</p>
						<Link href={`/${lang}/courses`}>
							<Button size='lg' variant='secondary' className='bg-white text-secondary hover:bg-gray-100'>
								{courseDict.viewAllCourses || 'Xem tất cả khóa học'}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
