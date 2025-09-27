'use client';
import { ChevronUp, Home, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

// Các mục menu.
const items = [
	{
		title: 'Khóa Học',
		url: '/tutor/course',
		icon: '/images/books.svg',
	},
	{
		title: 'Hồ sơ',
		url: '/tutor/profile',
		icon: '/images/mascot.svg',
	},
];

export function AppSidebar() {
	const { user, logout } = useAuth();
	const pathname = usePathname();

	return (
		<Sidebar className='px-2'>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className='p-10 text-primary font-bold text-center text-2xl'>
						JPE
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className='space-y-2'>
							{items.map((item) => {
								const isActive = pathname === item.url || '/tutor/course/create';
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											data-active={isActive}
											className='data-[active=true]:bg-[#ddf4ff] data-[active=true]:text-[#1cb0f6] data-[active=true]:border-[#1cb0f6] data-[active=true]:border py-7 px-4 font-semibold data-[active=true]:font-bold rounded-xl'
										>
											<Link href={item.url} className='flex items-center gap-5'>
												<Image src={item.icon} width={40} height={40} alt='biểu tượng' />
												<span className='text-lg'>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size='lg'
									className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
								>
									<Avatar>
										<AvatarImage src={user?.avatarUrl} alt='@shadcn' />
										<AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className='grid flex-1 text-left text-base leading-tight'>
										{user?.fullName}
									</div>
									<ChevronUp className='ml-auto size-4' />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
								side='bottom'
								align='end'
								sideOffset={4}
							>
								<DropdownMenuLabel className='p-0 font-normal'>
									<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
										<Avatar>
											<AvatarImage src={user?.avatarUrl} alt='@shadcn' />
											<AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
										</Avatar>
										<div className='grid flex-1 text-left text-sm leading-tight'>
											{user?.fullName}
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Link href='/' className='flex items-center gap-2'>
										<Home size={16} />
										Trang Chủ
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => logout()} className='cursor-pointer'>
									<LogOut />
									Đăng Xuất
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
