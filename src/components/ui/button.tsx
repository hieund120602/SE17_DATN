import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide',
	{
		variants: {
			variant: {
				default:
					'bg-white text-black border-slate-200 border-2 border-b-4 active:border-b-2 hover:bg-slate-100 text-slate-500',
				primary:
					'bg-primary text-white hover:bg-primary-600 border-primary-700 border-b-4 active:border-b-0 shadow-lg',
				primaryOutline:
					'bg-white text-primary hover:bg-primary-50 border-primary border-2 border-b-4 active:border-b-0',
				secondary:
					'bg-secondary text-white hover:bg-secondary-600 border-secondary-700 border-b-4 active:border-b-0 shadow-lg',
				secondaryOutline:
					'bg-white text-secondary hover:bg-secondary-50 border-secondary border-2 border-b-4 active:border-b-0',
				danger: 'bg-rose-500 text-white hover:bg-rose-600 border-rose-700 border-b-4 active:border-b-0 shadow-lg',
				dangerOutline:
					'bg-white text-rose-500 hover:bg-rose-50 border-rose-500 border-2 border-b-4 active:border-b-0',
				super: 'bg-primary text-white hover:bg-primary-600 border-primary-700 border-b-4 active:border-b-0 shadow-md hover:shadow-lg',
				superOutline:
					'bg-white text-primary hover:bg-primary-50 border-primary border-2 border-b-4 active:border-b-0',
				ghost: 'bg-transparent text-slate-500 border-transparent border-0 hover:bg-slate-100',
				sidebar: 'bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none',
				sidebarOutline:
					'bg-primary-50 text-primary border-primary-300 border-2 hover:bg-primary-100 transition-none',
				custom: 'bg-primary text-white hover:bg-primary-600 border-primary-700 border-b-4 active:border-b-0 shadow-md hover:shadow-lg',
			},
			size: {
				default: 'h-12 px-4 py-2',
				sm: 'h-9 px-3',
				lg: 'h-12 px-8',
				icon: 'h-10 w-10',
				rounded: 'rounded-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	}
);
Button.displayName = 'Button';

export { Button, buttonVariants };
