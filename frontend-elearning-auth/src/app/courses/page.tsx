import { getDictionary } from '@/lib/dictionary';
import { Locale } from '../../../i18n-config';
import CoursesPage from '@/app/[lang]/courses/page';

interface PageProps {
	params: {
		lang: Locale;
	};
}

export default async function Page({ params: { lang } }: PageProps) {
	const dictionary = await getDictionary(lang);

	return (
		<div className='min-h-screen bg-gray-50'>
			<CoursesPage dictionary={dictionary} currentLocale={lang} />
		</div>
	);
}
