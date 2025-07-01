'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
	Facebook,
	Instagram,
	// Youtube is deprecated
	YoutubeIcon,
	Twitter,
	Mail,
	Phone,
	MapPin,
	Send,
	ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Language {
	code: string;
	name: string;
	flagSrc: string;
	labelText: string;
}

const Footer = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [email, setEmail] = useState('');

	const languages: Language[] = [
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

	const pathnameSegments = pathname.split('/').filter(Boolean);
	const currentLocale = ['vi', 'jp'].includes(pathnameSegments[0]) ? pathnameSegments[0] : 'vi';

	const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

	const switchLanguage = (locale: string) => {
		if (locale === currentLocale) return;

		const pathWithoutLocale = pathnameSegments.slice(1).join('/');
		const newPath = `/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;

		router.push(newPath);
	};

	const handleSubscribe = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement newsletter subscription
		alert(`Subscribed with email: ${email}`);
		setEmail('');
	};

	// Language-specific content
	

	// Get the appropriate language content
	const t = content[currentLocale === 'jp' ? 'jp' : 'vi'];

	return (
		<footer className='bg-gradient-to-r from-[#5ece66] to-primary text-white pt-16 pb-8'>
			<div className='container-lg'>
				{/* Main footer content */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
					{/* Column 1: About */}
					<div className='space-y-4'>
						<div className='flex items-center'>
							<Image
								src='/images/Logo.gif'
								alt='JPE Logo'
								width={50}
								height={50}
								className='h-10 w-auto object-contain mr-2'
							/>
							<h3 className='text-white font-extrabold text-center text-xl italic'>JPE</h3>
						</div>
						<p className='text-white/80 text-sm leading-relaxed'>{t.about}</p>
						<div className='flex space-x-3'>
							<a
								href='#'
								className='bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-300'
							>
								<Facebook size={18} />
							</a>
							<a
								href='#'
								className='bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-300'
							>
								<Instagram size={18} />
							</a>
							<a
								href='#'
								className='bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-300'
							>
								<YoutubeIcon size={18} />
							</a>
							<a
								href='#'
								className='bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-300'
							>
								<Twitter size={18} />
							</a>
						</div>

						{/* Language Switcher */}
						<DropdownMenu>
							<DropdownMenuTrigger className='flex items-center px-3 py-2 bg-white/10 border-none rounded-md hover:bg-white/20 focus:outline-none transition-colors mt-2'>
								<span className='mr-2 font-semibold text-sm'>
									{currentLanguage.labelText}: {currentLanguage.name}
								</span>
								<ChevronDown className='h-4 w-4' />
							</DropdownMenuTrigger>
							<DropdownMenuContent align='start' className='w-64'>
								{languages.map((language) => (
									<DropdownMenuItem
										key={language.code}
										onClick={() => switchLanguage(language.code)}
										className={`flex items-center px-3 py-2 ${
											currentLocale === language.code ? 'bg-gray-100' : ''
										}`}
									>
										<div className='mr-2 w-6 h-4 relative overflow-hidden rounded'>
											<Image
												src={language.flagSrc}
												alt={language.code}
												fill
												className='object-cover'
											/>
										</div>
										<span>{language.name}</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Column 2: Quick Links */}
					<div className='space-y-4'>
						<h3 className="text-lg font-bold after:content-[''] after:block after:w-12 after:h-1 after:bg-white/40 after:mt-1">
							{t.quickLinks}
						</h3>
						<ul className='space-y-2'>
							<li>
								<Link
									href={`/${currentLocale}`}
									className='text-white/80 hover:text-white transition-colors duration-200 flex items-center'
								>
									<span className='mr-2'>›</span> {t.home}
								</Link>
							</li>
							<li>
								<Link
									href={`/${currentLocale}/courses`}
									className='text-white/80 hover:text-white transition-colors duration-200 flex items-center'
								>
									<span className='mr-2'>›</span> {t.courses}
								</Link>
							</li>
							<li>
								<Link
									href={`/${currentLocale}/combos`}
									className='text-white/80 hover:text-white transition-colors duration-200 flex items-center'
								>
									<span className='mr-2'>›</span> {t.combos}
								</Link>
							</li>
							<li>
								<Link
									href={`/${currentLocale}/about`}
									className='text-white/80 hover:text-white transition-colors duration-200 flex items-center'
								>
									<span className='mr-2'>›</span> {t.aboutUs}
								</Link>
							</li>
							<li>
								<Link
									href={`/${currentLocale}/contact`}
									className='text-white/80 hover:text-white transition-colors duration-200 flex items-center'
								>
									<span className='mr-2'>›</span> {t.contact}
								</Link>
							</li>
							<li>
								<Link
									href={`/${currentLocale}/faq`}
									className='text-white/80 hover:text-white transition-colors duration-200 flex items-center'
								>
									<span className='mr-2'>›</span> {t.faq}
								</Link>
							</li>
						</ul>
					</div>

					{/* Column 3: Contact Info */}
					<div className='space-y-4'>
						<h3 className="text-lg font-bold after:content-[''] after:block after:w-12 after:h-1 after:bg-white/40 after:mt-1">
							{t.contact}
						</h3>
						<ul className='space-y-3'>
							<li className='flex items-start'>
								<MapPin className='h-5 w-5 mr-3 mt-0.5 flex-shrink-0' />
								<span className='text-white/80'>
									Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng 550000
								</span>
							</li>
							<li className='flex items-center'>
								<Phone className='h-5 w-5 mr-3 flex-shrink-0' />
								<a href='tel:+84901234567' className='text-white/80 hover:text-white'>
									+84 90 123 4567
								</a>
							</li>
							<li className='flex items-center'>
								<Mail className='h-5 w-5 mr-3 flex-shrink-0' />
								<a href='mailto:info@jpe.edu.vn' className='text-white/80 hover:text-white'>
									info@jpe.edu.vn
								</a>
							</li>
						</ul>
					</div>

					{/* Column 4: Newsletter */}
					<div className='space-y-4'>
						<h3 className="text-lg font-bold after:content-[''] after:block after:w-12 after:h-1 after:bg-white/40 after:mt-1">
							{t.newsletter}
						</h3>
						<p className='text-white/80 text-sm'>{t.newsletterText}</p>
						<form onSubmit={handleSubscribe} className='flex'>
							<Input
								type='email'
								placeholder={t.emailPlaceholder}
								className='bg-white/10 border-0 text-white placeholder:text-white/60 focus-visible:ring-white/30'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							<Button
								type='submit'
								variant='superOutline'
								className='ml-2 bg-white text-primary hover:bg-white/90 border-0'
							>
								<Send className='h-4 w-4' />
							</Button>
						</form>
					</div>
				</div>

				{/* Divider */}
				<div className='h-px bg-white/20 my-6'></div>

				{/* Footer bottom */}
				<div className='flex flex-col md:flex-row justify-between items-center'>
					<div className='text-white/70 text-sm mb-4 md:mb-0'>
						© {new Date().getFullYear()} JPE. {t.rightsReserved}
					</div>
					<div className='flex space-x-4 text-sm text-white/70'>
						<Link href={`/${currentLocale}/privacy`} className='hover:text-white transition-colors'>
							{t.privacy}
						</Link>
						<Link href={`/${currentLocale}/terms`} className='hover:text-white transition-colors'>
							{t.terms}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
