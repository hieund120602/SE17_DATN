import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { AppProviders } from '@/providers';
import { Toaster } from '@/components/ui/toaster';
import HeaderAuth from '@/app/(auth)/components/header-auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Japanese Learning Platform',
	description: 'Learn Japanese language with our interactive platform',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				{/* <div
					className="relative bg-cover bg-center bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-black/30"
					style={{ backgroundImage: "url('/images/auth/bg-auth.jpg')" }}
				>
				</div> */}
				<AppProviders>
					<div className='flex flex-col items-center container-lg'>
						<HeaderAuth />
						<main className='flex justify-center items-center relative z-10 w-full'>
							{children}
							<Toaster />
						</main>
					</div>
				</AppProviders>
			</body>
		</html>
	);
}
