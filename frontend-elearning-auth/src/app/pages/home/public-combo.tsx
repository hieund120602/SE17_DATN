import Image from 'next/image';
import React from 'react';
import ComboCard from '@/app/pages/home/combo-card';
import { API_BASE_URL } from '@/lib/api';
import ClientOnly from '@/components/client-only';

interface PublicComboProps {
	dictionary: any;
	currentLocale: string;
}

// Server-side data fetching
async function getPublicCombos() {
	try {
		const response = await fetch(`${API_BASE_URL}/combos?page=0&size=6`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch combos: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data.content || [];
	} catch (error) {
		return [];
	}
}

const PublicCombo = async ({ dictionary, currentLocale }: PublicComboProps) => {
	const combos = await getPublicCombos();
	// Ensure dictionary and combos exist to prevent errors
	const dict = dictionary || {};
	const comboDict = dict.combos || {};

	return (
		<div className='sec-com'>
			<div className='relative container-lg'>
				{/* Decorative Elements */}
				<div className='absolute -top-10 right-0 w-20 h-20 bg-secondary/5 rounded-full blur-xl'></div>
				<div className='absolute -top-5 left-10 w-16 h-16 bg-accent/5 rounded-full blur-lg'></div>

				<div className='relative'>
					{/* Section Header */}
					<div className='text-center mb-16'>
						<div className='inline-flex items-center px-4 py-2 bg-secondary/10 rounded-full mb-6'>
							<span className='text-secondary font-medium text-sm'>
								{comboDict.badge || 'Special Offers'}
							</span>
						</div>

						<h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
							{comboDict.comboPackages || 'Combo Packages'}
						</h2>

						<p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
							{comboDict.description ||
								'Save more with our specially curated course combinations designed for comprehensive learning'}
						</p>

						{/* Decorative Line */}
						<div className='flex justify-center mt-8'>
							<div className='w-24 h-1 bg-gradient-to-r from-secondary to-accent rounded-full'></div>
						</div>
					</div>

					{/* Combos Grid */}
					{combos.length > 0 ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 items-stretch'>
							{combos.map((combo: any, index: number) => (
								<ClientOnly
									key={combo.id}
									fallback={
										<div className='bg-white rounded-2xl shadow-lg h-96 animate-pulse'>
											<div className='h-48 bg-gray-200 rounded-t-2xl'></div>
											<div className='p-6 space-y-4'>
												<div className='h-6 bg-gray-200 rounded'></div>
												<div className='h-4 bg-gray-200 rounded w-3/4'></div>
												<div className='h-4 bg-gray-200 rounded w-1/2'></div>
											</div>
										</div>
									}
								>
									<ComboCard
										combo={combo}
										index={index}
										dictionary={dictionary}
										currentLocale={currentLocale}
									/>
								</ClientOnly>
							))}
						</div>
					) : (
						<div className='flex flex-col items-center justify-center py-20'>
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
										d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 3l4 2 4-2-4-2z'
									/>
								</svg>
							</div>
							<h3 className='text-2xl font-semibold text-gray-700 mb-3'>
								{comboDict.noCombos || 'No combo packages available'}
							</h3>
							<p className='text-gray-500 text-center max-w-md leading-relaxed'>
								{comboDict.noCombosMessage ||
									'We are creating amazing combo packages for you. Stay tuned!'}
							</p>
						</div>
					)}

					{/* View All Button */}
					{combos.length > 0 && (
						<div className='text-center'>
							<button className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-secondary to-secondary-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-secondary/25 transform hover:scale-105 transition-all duration-300'>
								<span>{comboDict.viewAll || 'View All Combos'}</span>
								<svg className='w-5 h-5 ml-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 7l5 5m0 0l-5 5m5-5H6'
									/>
								</svg>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PublicCombo;
