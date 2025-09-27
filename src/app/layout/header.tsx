'use client';
import Image from 'next/image';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, BookOpen, UserCog, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { NotificationBell } from '@/components/notification-bell';

interface Language {
	code: string;
	name: string;
	flagSrc: string;
	labelText: string;
}

interface UserMenuText {
	myCourses: string;
	profile: string;
	logout: string;
	login: string;
	register: string;
}

// Constants outside component to prevent recreation on each render
const LANGUAGES: Language[] = [
	{
		code: 'vi',
		name: 'Tiếng Việt',
		flagSrc: '/images/vi.svg',
		labelText: 'NGÔN NGỮ HIỂN THỊ',
	},
	{
		code: 'jp',
		name: '日本語',
		flagSrc: '/images/jp.svg',
		labelText: 'サイトの言語',
	},
];

const Header = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const { user, logout } = useAuth();

	// Extract locale from path once
	const pathnameSegments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
	const currentLocale = useMemo(
		() => (pathnameSegments[0] && ['vi', 'jp'].includes(pathnameSegments[0]) ? pathnameSegments[0] : 'vi'),
		[pathnameSegments]
	);

	// Get dictionary with optimized query
	const { data: dict } = useQuery({
		queryKey: ['dictionary', currentLocale],
		queryFn: async () => {
			try {
				const response = await fetch(`/api/dictionary?lang=${currentLocale}`);
				if (!response.ok) {
					console.error('Failed to fetch dictionary');
					return {};
				}
				return response.json();
			} catch (error) {
				console.error('Dictionary fetch error:', error);
				return {};
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Memoize current language
	const currentLanguage = useMemo(
		() => LANGUAGES.find((lang) => lang.code === currentLocale) || LANGUAGES[0],
		[currentLocale]
	);

	// Memoize user menu text
	const userMenu = useMemo(
		() => ({
			myCourses: dict?.user?.myCourses || 'My Courses',
			profile: dict?.user?.profile || 'Profile',
			logout: dict?.user?.logout || 'Logout',
			login: dict?.user?.login || 'Login',
			register: dict?.user?.register || 'Register',
		}),
		[dict?.user]
	);

	// Memoized functions to prevent recreation on each render
	const switchLanguage = useCallback(
		(locale: string) => {
			if (locale === currentLocale) return;
			const pathWithoutLocale = pathnameSegments.slice(1).join('/');
			router.push(`/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`);
		},
		[currentLocale, pathnameSegments, router]
	);

	const handleLogout = useCallback(async () => {
		try {
			await logout();
			router.push(`/${currentLocale}`);
		} catch (error) {
			console.error('Logout error:', error);
		}
	}, [logout, router, currentLocale]);

	// Get initials function
	const getInitials = useCallback((name: string) => {
		if (!name) return 'JP';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);
	}, []);

	// Optimized scroll handler with debounce
	useEffect(() => {
		let lastScrollTop = 0;
		let ticking = false;

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			if (!ticking) {
				window.requestAnimationFrame(() => {
					if (scrollTop > 10) {
						if (!scrolled) setScrolled(true);
					} else {
						if (scrolled) setScrolled(false);
					}
					ticking = false;
				});
				ticking = true;
			}
			lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [scrolled]);

	return (
		<header className='fixed w-full top-0 z-50'>
			<div
				className={`py-2 sm:py-4 w-full transition-all duration-300 shadow-lg backdrop-blur-md ${
					scrolled ? 'bg-white/95' : 'bg-white'
				}`}
			>
				<div className='container-lg'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center'>
							<Link href={`/${currentLocale}`}>
								<div className='flex items-center group'>
									<div className='relative w-10 h-10'>
										<Image
											src='/images/Logo.gif'
											alt='Logo'
											fill
											sizes='(max-width: 768px) 30px, 40px'
											priority
											className='object-contain transition-transform group-hover:scale-110'
										/>
									</div>
									<h3 className='text-primary font-extrabold text-center text-lg sm:text-2xl italic ml-2 group-hover:text-primary-600 transition-colors'>
										JPE
									</h3>
								</div>
							</Link>
						</div>

						<div className='flex items-center space-x-4'>
							{/* Notification Center - Only show for authenticated users */}
							{user && <NotificationBell />}

							{/* Language Selector */}
							<DropdownMenu>
								<DropdownMenuTrigger className='flex items-center cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 hover:text-primary transition-colors'>
									<Image
										src={currentLanguage.flagSrc}
										alt={currentLanguage.name}
										width={24}
										height={24}
										className='mr-2'
									/>
									<span className='hidden sm:inline'>{currentLanguage.name}</span>
									<ChevronDown className='w-4 h-4 ml-1' />
								</DropdownMenuTrigger>
								<DropdownMenuContent className='w-48' align='end'>
									<div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide'>
										{currentLanguage.labelText}
									</div>
									{LANGUAGES.map((lang) => (
										<DropdownMenuItem
											key={lang.code}
											onClick={() => switchLanguage(lang.code)}
											className={`flex items-center cursor-pointer ${
												lang.code === currentLocale ? 'bg-primary-50' : ''
											}`}
										>
											<Image
												src={lang.flagSrc}
												alt={lang.name}
												width={20}
												height={20}
												className='mr-3'
											/>
											<span>{lang.name}</span>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Authentication */}
							<div className='flex items-center space-x-2'>
								{user ? (
									<DropdownMenu>
										<DropdownMenuTrigger className='flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors'>
											{user.avatarUrl ? (
												<Image
													src={user.avatarUrl}
													alt={user.fullName}
													width={36}
													height={36}
													className='rounded-full border-2 border-primary-200'
												/>
											) : (
												<div className='w-9 h-9 bg-gradient-to-r from-primary to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
													{getInitials(user.fullName)}
												</div>
											)}
											<span className='ml-2 text-sm font-medium text-gray-700 hidden sm:inline'>
												{user.fullName}
											</span>
											<ChevronDown className='w-4 h-4 ml-1 text-gray-500' />
										</DropdownMenuTrigger>
										<DropdownMenuContent className='w-48' align='end'>
											<div className='px-3 py-2 border-b border-gray-100'>
												<p className='text-sm font-medium text-gray-700'>{user.fullName}</p>
												<p className='text-xs text-gray-500'>{user.email}</p>
											</div>
											<DropdownMenuItem
												onClick={() => router.push(`/${currentLocale}/my-course`)}
												className='flex items-center cursor-pointer'
											>
												<BookOpen className='w-4 h-4 mr-3' />
												{userMenu.myCourses}
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => router.push(`/${currentLocale}/profile`)}
												className='flex items-center cursor-pointer'
											>
												<UserCog className='w-4 h-4 mr-3' />
												{userMenu.profile}
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={handleLogout}
												className='flex items-center cursor-pointer text-red-600 hover:text-red-700'
											>
												<LogOut className='w-4 h-4 mr-3' />
												{userMenu.logout}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<>
										<Link
											href={`/login`}
											className='text-sm font-medium text-gray-700 hover:text-primary transition-colors px-3 py-2'
										>
											{userMenu.login}
										</Link>
										<Link
											href={`/register`}
											className='bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg'
										>
											{userMenu.register}
										</Link>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
