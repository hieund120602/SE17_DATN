import Image from 'next/image';
import React from 'react';

const Header = () => {
	return (
		<div className='sticky top-0 left-0 w-full z-50 bg-white py-2'>
			<div className='container-lg'>
				<div className='flex items-center'>
					<div className='flex items-center'>
						<Image src='/images/Logo.gif' width={50} height={50} alt='Logo' />
						<h3 className='text-primary font-extrabold text-center text-lg sm:text-2xl italic'>JPE</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Header;
