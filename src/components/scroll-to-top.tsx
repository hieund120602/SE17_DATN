'use client';
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToTopProps {
	showBelow?: number;
	right?: number;
	bottom?: number;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ showBelow = 300, right = 20, bottom = 20 }) => {
	const [isVisible, setIsVisible] = useState(false);

	// Handle scroll event to show/hide the button
	const handleScroll = () => {
		if (window.pageYOffset > showBelow) {
			if (!isVisible) setIsVisible(true);
		} else {
			if (isVisible) setIsVisible(false);
		}
	};

	// Scroll to top smoothly
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	// Add scroll listener
	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		}
	}, [showBelow, isVisible]);

	// Animation variants for the button
	const buttonVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
		tap: { scale: 0.95 },
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.button
					className='fixed z-50 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
					style={{ right: `${right}px`, bottom: `${bottom}px` }}
					onClick={scrollToTop}
					aria-label='Scroll to top'
					initial='hidden'
					animate='visible'
					exit='hidden'
					variants={buttonVariants}
					whileTap='tap'
					transition={{ duration: 0.2 }}
				>
					<ArrowUp size={24} />
				</motion.button>
			)}
		</AnimatePresence>
	);
};

export default ScrollToTop;
