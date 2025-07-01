'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const Banner = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return <div className='w-full h-64'></div>;
	}

	return (
		<div className='relative w-full'>
			<div className='absolute top-0 sm:-top-0 xl:-top-1/4 2xl:-top-2/3 left-0 w-full'>
				<Image src='/images/bg-banner.png' width={1820} height={1200} alt='bg-banner' className='w-full' />
			</div>
			<div className='sec-com'>
				<div className='container-lg'>
					<div className='flex justify-center lg:justify-between'>
						<div className='flex flex-col gap-3 lg:gap-5'>
							<span className='text-base sm:text-lg lg:text-2xl text-white font-bold'>Khóa học</span>
							<h3 className='text-xl sm:text-3xl lg:text-7xl font-bold leading-tight text-slate-800'>
								Khóa học hay <br className='hidden lg:block' />
							</h3>
							<span className='text-base sm:text-lg lg:text-2xl text-white font-bold'>Bán khóa học</span>
							<Button className='mt-2 lg:mt-7 w-36 lg:w-72 rotate-1' variant='primaryOutline'>
								Xem thêm
							</Button>
						</div>
						<Image
							src='/images/item-banner.png'
							width={400}
							height={420}
							alt='item-banner'
							className='sm:block hidden w-72 lg:w-96'
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Banner;
