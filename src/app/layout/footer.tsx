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
import { useMemo, useCallback } from 'react';
import NewsletterSubscription from '@/components/newsletter-subscription';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ClientOnly from '@/components/client-only';

interface Language {
	code: string;
	name: string;
	flagSrc: string;
	labelText: string;
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

// Language-specific content defined outside component
const CONTENT = {
	vi: {
		about: 'JPE cam kết cung cấp chương trình học tiếng Nhật chất lượng cao, giúp học viên đạt chứng chỉ JLPT và cải thiện kỹ năng giao tiếp cho cuộc sống hàng ngày và công việc.',
		quickLinks: 'Liên kết nhanh',
		home: 'Trang chủ',
		courses: 'Khóa học',
		combos: 'Gói combo',
		aboutUs: 'Về chúng tôi',
		contact: 'Liên hệ',
		faq: 'Câu hỏi thường gặp',
		newsletter: 'Bản tin',
		newsletterText: 'Đăng ký nhận bản tin để cập nhật thông tin và ưu đãi đặc biệt.',
		emailPlaceholder: 'Email của bạn',
		subscribe: 'Đăng ký',
		rightsReserved: 'Tất cả quyền được bảo lưu.',
		privacy: 'Chính sách bảo mật',
		terms: 'Điều khoản dịch vụ',
	},
	jp: {
		about: 'JPEは高品質の日本語教育を提供し、学生がJLPT認定を取得し、日常生活や仕事のための会話スキルを向上させることを目指します。',
		quickLinks: 'クイックリンク',
		home: 'ホーム',
		courses: 'コース',
		combos: 'コースパッケージ',
		aboutUs: '私たちについて',
		contact: 'お問い合わせ',
		faq: 'よくある質問',
		newsletter: 'ニュースレター',
		newsletterText: '更新情報や特別オファーを受け取るには、ニュースレターにご登録ください。',
		emailPlaceholder: 'メールアドレス',
		subscribe: '登録する',
		rightsReserved: '全著作権所有。',
		privacy: 'プライバシーポリシー',
		terms: '利用規約',
	},
};

// Extracted components for better organization and performance
const SocialIcon = ({ icon: Icon, href = '#' }: { icon: any; href?: string }) => (
	<a
		href={href}
		className='bg-primary-500/10 hover:bg-primary-500/20 p-2 rounded-full transition-colors duration-300'
	>
		<Icon size={18} className='text-primary-700' />
	</a>
);

const QuickLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
	<li>
		<Link
			href={href}
			className='text-gray-700 hover:text-primary-700 transition-colors duration-200 flex items-center'
		>
			<span className='mr-2 text-primary-500'>›</span> {children}
		</Link>
	</li>
);

const ContactItem = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
	<li className='flex items-start'>
		<Icon className='h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-primary-500' />
		{children}
	</li>
);

const Footer = () => {
	const router = useRouter();
	const pathname = usePathname();

	// Extract locale from path once and memoize derived values
	const pathnameSegments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

	const currentLocale = useMemo(
		() => (pathnameSegments[0] && ['vi', 'jp'].includes(pathnameSegments[0]) ? pathnameSegments[0] : 'vi'),
		[pathnameSegments]
	);

	const currentLanguage = useMemo(
		() => LANGUAGES.find((lang) => lang.code === currentLocale) || LANGUAGES[0],
		[currentLocale]
	);

	// Get the appropriate language content
	const t = useMemo(() => CONTENT[currentLocale === 'jp' ? 'jp' : 'vi'], [currentLocale]);

	// Current year for copyright - handled safely for SSR
	const currentYear = useMemo(() => {
		return typeof window !== 'undefined' ? new Date().getFullYear() : 2024;
	}, []);

	// Memoized handlers
	const switchLanguage = useCallback(
		(locale: string) => {
			if (locale === currentLocale) return;
			const pathWithoutLocale = pathnameSegments.slice(1).join('/');
			router.push(`/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`);
		},
		[currentLocale, pathnameSegments, router]
	);

	return (
		<footer className='relative py-10 overflow-hidden border-t border-primary-100'>
			{/* Background decorations */}
			<div className='absolute inset-0 z-[-1]'>
				<div className='absolute top-0 left-0 w-full h-full bg-white/90 backdrop-blur-sm'></div>
				<div className='absolute top-0 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl'></div>
				<div className='absolute bottom-0 left-0 w-80 h-80 bg-primary-300/10 rounded-full blur-3xl'></div>
			</div>

			<div className='container-lg relative z-10'>
				{/* Main footer content */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
					{/* Column 1: About */}
					<div className='space-y-4'>
						<div className='flex items-center'>
							<div className='relative w-12 h-12 mr-3'>
								<Image src='/images/Logo.gif' alt='JPE Logo' fill className='object-contain' priority />
							</div>
							<h3 className='text-primary-700 font-extrabold text-center text-2xl italic tracking-wider'>
								JPE
							</h3>
						</div>
						<p className='text-gray-600 text-sm leading-relaxed'>{t.about}</p>
						<div className='flex space-x-3 mt-4'>
							<SocialIcon icon={Facebook} />
							<SocialIcon icon={Instagram} />
							<SocialIcon icon={YoutubeIcon} />
							<SocialIcon icon={Twitter} />
						</div>

						{/* Language Switcher */}
						<DropdownMenu>
							<DropdownMenuTrigger className='flex items-center px-3 py-2 bg-primary-500/10 border-none rounded-md hover:bg-primary-500/20 focus:outline-none transition-colors mt-2'>
								<Image
									src={currentLanguage.flagSrc}
									alt={currentLanguage.name}
									width={20}
									height={12}
									className='mr-2'
								/>
								<span className='mr-2 font-medium text-sm text-gray-700'>{currentLanguage.name}</span>
								<ChevronDown className='h-4 w-4 text-gray-500' />
							</DropdownMenuTrigger>
							<DropdownMenuContent align='start' className='w-52'>
								{LANGUAGES.map((language) => (
									<DropdownMenuItem
										key={language.code}
										onClick={() => switchLanguage(language.code)}
										className={`flex items-center px-3 py-2 ${
											currentLocale === language.code ? 'bg-primary-50' : ''
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
						<h3 className='text-lg font-bold text-primary-700 border-b border-primary-200 pb-2 mb-4'>
							{t.quickLinks}
						</h3>
						<ul className='space-y-3 grid grid-cols-1'>
							<QuickLink href={`/${currentLocale}`}>{t.home}</QuickLink>
							<QuickLink href={`/${currentLocale}/courses`}>{t.courses}</QuickLink>
							<QuickLink href={`/${currentLocale}/combos`}>{t.combos}</QuickLink>
							<QuickLink href={`/${currentLocale}/about`}>{t.aboutUs}</QuickLink>
							<QuickLink href={`/${currentLocale}/contact`}>{t.contact}</QuickLink>
							<QuickLink href={`/${currentLocale}/faq`}>{t.faq}</QuickLink>
						</ul>
					</div>

					{/* Column 3: Contact Info */}
					<div className='space-y-4'>
						<h3 className='text-lg font-bold text-primary-700 border-b border-primary-200 pb-2 mb-4'>
							{t.contact}
						</h3>
						<ul className='space-y-4'>
							<ContactItem icon={MapPin}>
								<span className='text-gray-600'>
									123 Nguyen Hue, District 1, Ho Chi Minh City, Vietnam
								</span>
							</ContactItem>
							<ContactItem icon={Phone}>
								<a href='tel:+84901234567' className='text-gray-600 hover:text-primary-700'>
									+84 90 123 4567
								</a>
							</ContactItem>
							<ContactItem icon={Mail}>
								<a href='mailto:info@jpe.edu.vn' className='text-gray-600 hover:text-primary-700'>
									info@jpe.edu.vn
								</a>
							</ContactItem>
						</ul>
					</div>

					{/* Column 4: Newsletter */}
					<div className='space-y-4'>
						<NewsletterSubscription
							variant='minimal'
							title={t.newsletter}
							description={t.newsletterText}
							placeholder={t.emailPlaceholder}
							buttonText={t.subscribe}
							defaultLanguage={currentLocale as 'vi' | 'en' | 'jp'}
						/>
					</div>
				</div>

				{/* Divider */}
				<div className='h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent my-6'></div>

				{/* Footer bottom */}
				<div className='flex flex-col md:flex-row justify-between items-center'>
					<div className='text-gray-500 text-sm mb-4 md:mb-0'>© 2025 JPE. {t.rightsReserved}</div>
					<div className='flex space-x-6 text-sm text-gray-500'>
						<Link href={`/${currentLocale}/privacy`} className='hover:text-primary-700 transition-colors'>
							{t.privacy}
						</Link>
						<Link href={`/${currentLocale}/terms`} className='hover:text-primary-700 transition-colors'>
							{t.terms}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
