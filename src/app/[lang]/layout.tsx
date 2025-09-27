import type { Metadata } from 'next';
import { Ruda } from 'next/font/google';
import '../globals.css';
import Header from '@/app/layout/header';
import { AppProviders } from '@/providers';
import Footer from '@/app/layout/footer';
import ScrollToTop from '@/components/scroll-to-top';
import ClientOnly from '@/components/client-only';
import Link from 'next/link';

// Load font once outside component
const poppins = Ruda({
	weight: ['400', '500', '600', '700', '800', '900'],
	subsets: ['latin', 'cyrillic', 'vietnamese', 'latin-ext'],
	display: 'swap', // Optimize font display
	fallback: ['system-ui', 'sans-serif'], // Provide fallback fonts
});

export const metadata: Metadata = {
	title: 'JPE - Japanese Learning Platform',
	description: 'Learn Japanese with professional tutors and interactive courses',
	viewport: 'width=device-width, initial-scale=1',
	themeColor: '#5EAA60',
	colorScheme: 'light',
	icons: {
		icon: '/favicon.ico',
		apple: '/apple-icon.png',
	},
};

interface LanguageLayoutProps {
	children: React.ReactNode;
	params: { lang: string };
}

export default function LanguageLayout({ children, params }: LanguageLayoutProps) {
	return (
		<div className={poppins.className}>
			<Header />
			<main>{children}</main>
			<Footer />
			<ScrollToTop showBelow={400} right={25} bottom={75} />
		</div>
	);
}
