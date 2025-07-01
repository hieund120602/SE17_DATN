'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { Fragment } from 'react';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function AppBreadcrumb() {
	const pathname = usePathname();

	// Skip rendering for root path
	if (pathname === '/') {
		return null;
	}

	// Split the pathname into segments and filter out empty strings
	const segments = pathname.split('/').filter(Boolean);

	// Build the breadcrumb paths
	const breadcrumbs = segments.map((segment, index) => {
		// Construct the URL for this breadcrumb
		const href = '/' + segments.slice(0, index + 1).join('/');

		// Convert to title case and replace hyphens with spaces
		const label = segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

		return { href, label };
	});

	return (
		<Breadcrumb className='ml-2'>
			<BreadcrumbList>
				{/* Home link */}
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href='/' className='flex items-center'>
							<Home size={16} />
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>

				{/* Only add the first separator if we have breadcrumbs */}
				{breadcrumbs.length > 0 && <BreadcrumbSeparator />}

				{breadcrumbs.map((breadcrumb, index) => (
					<Fragment key={breadcrumb.href}>
						{/* Breadcrumb item */}
						<BreadcrumbItem>
							{index === breadcrumbs.length - 1 ? (
								<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link href={breadcrumb.href}>{breadcrumb.label}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>

						{/* Add separator between items, but not after the last item */}
						{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
