import ClientPage from '@/app/pages/home/client-page';
import { getDictionary } from '../dictionaries';

export default async function HomePage({ params }: { params: { lang: string } }) {
	const dictionary = await getDictionary(params.lang);

	return <ClientPage dictionary={dictionary} lang={params.lang} />;
}
