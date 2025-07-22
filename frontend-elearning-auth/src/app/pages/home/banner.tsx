'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BannerProps {
	dictionary: {
		banner: {
			subheading1: string;
			mainHeading: string;
			subheading2: string;
			button: string;
		};
	};
}

const Banner = ({ dictionary }: BannerProps) => {
	const router = useRouter();
	const [showDemo, setShowDemo] = useState(false);

	const handleLearnMore = () => {
		// Scroll to the "Why Choose JPE" section
		const whyChooseSection = document.getElementById('why-choose-section');
		if (whyChooseSection) {
			whyChooseSection.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const handleWatchDemo = () => {
		setShowDemo(true);
	};

	return (
		<div className='relative w-full min-h-screen flex items-center overflow-hidden'>
			{/* Background Image */}
			<div className='absolute inset-0 z-0'>
				<Image
					src='/images/banner.webp'
					fill
					alt='Japanese Learning Banner'
					className='object-cover'
					priority
					quality={90}
				/>
				{/* Modern gradient overlay */}
				<div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent'></div>
				<div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent'></div>
			</div>

			{/* Floating Elements */}
			<div className='absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse'></div>
			<div className='absolute bottom-40 right-40 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000'></div>
			<div className='absolute top-1/2 right-10 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-pulse delay-500'></div>

			{/* Content */}
			<div className='relative z-10 container-lg'>
				<div className='max-w-4xl'>
					{/* Badge */}
					<div className='inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6'>
						<span className='text-white/90 text-sm font-medium'>🌸 {dictionary.banner.subheading1}</span>
					</div>

					{/* Main Heading */}
					<h1 className='text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6'>
						<span className='text-white drop-shadow-2xl'>
							{dictionary.banner.mainHeading.split(' ').map((word, index) => (
								<span key={index} className={index % 2 === 1 ? 'text-primary-300' : ''}>
									{word}{' '}
								</span>
							))}
						</span>
					</h1>

					{/* Subtitle */}
					<p className='text-xl lg:text-2xl text-white/90 font-medium mb-8 max-w-2xl leading-relaxed drop-shadow-lg'>
						{dictionary.banner.subheading2}
					</p>

					{/* CTA Buttons */}
					<div className='flex flex-col sm:flex-row gap-4'>
						<Button
							className='px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary-600 text-white rounded-full shadow-2xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300 border-0'
							variant='primary'
							onClick={handleLearnMore}
						>
							<span className='flex items-center gap-2'>
								{dictionary.banner.button}
								<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 7l5 5m0 0l-5 5m5-5H6'
									/>
								</svg>
							</span>
						</Button>

						<Button
							className='px-8 py-4 text-lg font-semibold bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300'
							variant='primaryOutline'
							onClick={handleWatchDemo}
						>
							<span className='flex items-center gap-2'>
								<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
									/>
								</svg>
								Watch Demo
							</span>
						</Button>
					</div>

					{/* Stats */}
					<div className='flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20'>
						<div className='text-center'>
							<div className='text-2xl font-bold text-white'>10K+</div>
							<div className='text-white/70 text-sm'>Students</div>
						</div>
						<div className='text-center'>
							<div className='text-2xl font-bold text-white'>95%</div>
							<div className='text-white/70 text-sm'>Success Rate</div>
						</div>
						<div className='text-center'>
							<div className='text-2xl font-bold text-white'>50+</div>
							<div className='text-white/70 text-sm'>Courses</div>
						</div>
						<div className='text-center'>
							<div className='text-2xl font-bold text-white'>24/7</div>
							<div className='text-white/70 text-sm'>Support</div>
						</div>
					</div>
				</div>
			</div>

			{/* Scroll Indicator */}
			<div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10'>
				<div className='flex flex-col items-center text-white/70 animate-bounce'>
					<span className='text-sm mb-2'>Scroll Down</span>
					<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M19 14l-7 7m0 0l-7-7m7 7V3'
						/>
					</svg>
				</div>
			</div>

			{/* Demo Video Dialog */}
			<Dialog open={showDemo} onOpenChange={setShowDemo}>
				<DialogContent className='max-w-4xl'>
					<DialogHeader>
						<DialogTitle>JPE Japanese Learning Platform Demo</DialogTitle>
					</DialogHeader>
					<div className='relative pt-[56.25%] w-full'>
						<iframe
							className='absolute top-0 left-0 w-full h-full rounded-lg'
							src='https://www.youtube.com/embed/LTejJnrzGPM'
							title='JPE Demo Video'
							allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
							allowFullScreen
						></iframe>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Banner;
