import { getDictionary } from '../dictionaries';
import Banner from '@/app/pages/home/banner';
import PublicCourse from '@/app/pages/home/public-course';
import PublicCombo from '@/app/pages/home/public-combo';
import WhyChooseJPE from '@/app/pages/home/why-choose';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for client-only component
const PaymentHandler = dynamic(() => import('@/app/pages/home/payment-handler'), {
	ssr: false,
});

// Loading components
const CoursesSkeleton = () => (
	<div className='container-lg py-16'>
		<div className='animate-pulse'>
			<div className='h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4'></div>
			<div className='h-4 bg-gray-200 rounded w-2/3 mx-auto mb-12'></div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{[1, 2, 3].map((i) => (
					<div key={i} className='bg-gray-200 rounded-xl h-80'></div>
				))}
			</div>
		</div>
	</div>
);

const CombosSkeleton = () => (
	<div className='container-lg py-16'>
		<div className='animate-pulse'>
			<div className='h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4'></div>
			<div className='h-4 bg-gray-200 rounded w-2/3 mx-auto mb-12'></div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{[1, 2, 3].map((i) => (
					<div key={i} className='bg-gray-200 rounded-xl h-80'></div>
				))}
			</div>
		</div>
	</div>
);

export default async function HomePage({ params }: { params: { lang: string } }) {
	const dictionary = await getDictionary(params.lang);

	return (
		<>
			<main className='min-h-screen'>
				{/* Hero Section */}
				<section className='relative'>
					<Banner dictionary={dictionary} />
				</section>

				{/* Courses Section */}
				<Suspense fallback={<CoursesSkeleton />}>
					<PublicCourse dictionary={dictionary} currentLocale={params.lang} />
				</Suspense>

				{/* Combos Section */}
				<Suspense fallback={<CombosSkeleton />}>
					<PublicCombo dictionary={dictionary} currentLocale={params.lang} />
				</Suspense>

				{/* Why Choose Section */}
				<WhyChooseJPE dictionary={dictionary} />
			</main>
			<PaymentHandler dictionary={dictionary} lang={params.lang} />
		</>
	);
}
