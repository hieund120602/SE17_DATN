import * as React from 'react';
import { cn } from '@/lib/utils';

// Table Wrapper
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<div className='relative w-full overflow-auto rounded-2xl border-2 border-slate-200 bg-white shadow-sm'>
			<table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
		</div>
	)
);
Table.displayName = 'Table';

// Table Header (thead)
const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<thead
			ref={ref}
			className={cn(
				'bg-slate-100 text-slate-500 uppercase text-xs font-bold tracking-wide [&_tr]:border-b-2',
				className
			)}
			{...props}
		/>
	)
);
TableHeader.displayName = 'TableHeader';

// Table Body (tbody)
const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
	)
);
TableBody.displayName = 'TableBody';

// Table Footer (tfoot)
const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<tfoot
			ref={ref}
			className={cn(
				'border-t-2 border-slate-200 bg-slate-50 font-medium text-slate-500 [&>tr]:last:border-b-0',
				className
			)}
			{...props}
		/>
	)
);
TableFooter.displayName = 'TableFooter';

// Table Row (tr)
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
	({ className, ...props }, ref) => (
		<tr
			ref={ref}
			className={cn(
				'border-b-2 border-slate-100 transition-colors hover:bg-slate-100 active:border-b hover:shadow-sm data-[state=selected]:bg-sky-100',
				className
			)}
			{...props}
		/>
	)
);
TableRow.displayName = 'TableRow';

// Table Head Cell (th)
const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
	({ className, ...props }, ref) => (
		<th
			ref={ref}
			className={cn(
				'h-12 px-4 text-left align-middle font-bold text-slate-600 [&:has([role=checkbox])]:pr-0',
				className
			)}
			{...props}
		/>
	)
);
TableHead.displayName = 'TableHead';

// Table Body Cell (td)
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
	({ className, ...props }, ref) => (
		<td
			ref={ref}
			className={cn('h-12 px-4 py-2 align-middle text-slate-600 text-sm font-medium', className)}
			{...props}
		/>
	)
);
TableCell.displayName = 'TableCell';

// Table Caption (caption)
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
	({ className, ...props }, ref) => (
		<caption ref={ref} className={cn('mt-4 text-xs text-slate-400', className)} {...props} />
	)
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption };
