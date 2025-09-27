'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyProps {
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * ClientOnly component prevents hydration mismatches by only rendering
 * children on the client side after the component has mounted.
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
