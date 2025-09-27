import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarItem {
	id: string;
	label: string;
	icon: React.ReactNode;
}

interface SidebarProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	sidebarItems: SidebarItem[];
	activeTab: string;
	navigateToTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, sidebarItems, activeTab, navigateToTab }) => {
	return (
		<div
			className={`${
				sidebarOpen ? 'w-64' : 'w-20'
			} flex-shrink-0 h-fit sticky top-24 left-0 transition-all duration-300 bg-white rounded-lg shadow-sm mr-6 overflow-hidden border border-gray-200`}
		>
			<div className='flex justify-between items-center px-4 py-3 border-b border-gray-200'>
				<h2 className={`font-medium text-emerald-700 ${sidebarOpen ? 'block' : 'hidden'}`}>Các bước</h2>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='text-gray-500 hover:text-emerald-600'
				>
					{sidebarOpen ? <PanelLeftClose className='h-5 w-5' /> : <PanelLeftOpen className='h-5 w-5' />}
				</Button>
			</div>

			<nav className='px-2 py-4'>
				<ul className='space-y-1'>
					{sidebarItems.map((item) => (
						<li key={item.id}>
							<Button
								variant={activeTab === item.id ? 'sidebarOutline' : 'ghost'}
								className={`w-full flex items-center ${
									sidebarOpen ? 'justify-start' : 'justify-center'
								}  gap-3 ${
									activeTab === item.id
										? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								onClick={() => navigateToTab(item.id)}
							>
								{item.icon}
								{sidebarOpen && <span>{item.label}</span>}
							</Button>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};

export default Sidebar;
