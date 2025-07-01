import React, { FC, useEffect, useState } from 'react';
import { CheckCircle, GraduationCap, Briefcase } from 'lucide-react';

interface AnimatedTabProps {
	activeTab: number;
	setActiveTab: (tab: number) => void;
}

const AnimatedTab: FC<AnimatedTabProps> = ({ activeTab, setActiveTab }) => {
	const [isMobile, setIsMobile] = useState(false);

	// Track window resize to set mobile state
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Set initial value
		handleResize();

		// Add event listener
		window.addEventListener('resize', handleResize);

		// Clean up
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='w-full max-w-3xl mx-auto'>
			<ul className='flex items-center bg-gray-100 rounded-full p-1 relative'>
				{/* Animated background that moves based on active tab */}
				<div
					className={`
            absolute h-[85%] transition-all duration-500 rounded-full bg-gradient-to-r from-green-400 to-blue-500
            ${isMobile ? 'w-[32%]' : 'w-[33.3%]'}
            ${activeTab === 1 ? 'translate-x-[0%]' : activeTab === 2 ? 'translate-x-[100%]' : 'translate-x-[200%]'}
          `}
				></div>

				{/* Tab items */}
				<li
					className={`flex-1 flex justify-center items-center py-2 z-10 transition duration-300 cursor-pointer ${
						activeTab === 1 ? 'text-white font-medium' : 'text-gray-600'
					}`}
					onClick={() => setActiveTab(1)}
				>
					<CheckCircle className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
					<span className={isMobile ? 'hidden md:inline' : ''}>Hồ sơ</span>
				</li>

				<li
					className={`flex-1 flex justify-center items-center py-2 z-10 transition duration-300 cursor-pointer ${
						activeTab === 2 ? 'text-white font-medium' : 'text-gray-600'
					}`}
					onClick={() => setActiveTab(2)}
				>
					<GraduationCap className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
					<span className={isMobile ? 'hidden md:inline' : ''}>Học vấn</span>
				</li>

				<li
					className={`flex-1 flex justify-center items-center py-2 z-10 transition duration-300 cursor-pointer ${
						activeTab === 3 ? 'text-white font-medium' : 'text-gray-600'
					}`}
					onClick={() => setActiveTab(3)}
				>
					<Briefcase className={`${isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
					<span className={isMobile ? 'hidden md:inline' : ''}>Kinh nghiệm</span>
				</li>
			</ul>
		</div>
	);
};

export default AnimatedTab;
