'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Check, User, GraduationCap } from 'lucide-react';
import type { AccountType } from './account-creation-flow';
import Image from 'next/image';

interface AccountTypeStepProps {
	selectedType: AccountType;
	onSelectType: (type: AccountType) => void;
	onContinue: () => void;
}

export default function AccountTypeStep({ selectedType, onSelectType, onContinue }: AccountTypeStepProps) {
	return (
		<div className='p-6 space-y-6 max-w-3xl mx-auto w-full'>
			<div className='text-center space-y-2'>
				<h2 className='text-xl sm:text-2xl font-bold'>Bạn muốn mở tài khoản ... ?</h2>
				<p className='text-gray-500'>Xin vui lòng chọn tài khoản bạn muốn tạo</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<AccountTypeCard
					type='student'
					title='Học viên'
					description='Bạn là Học Viên muốn tìm những khóa học để nâng cấp kĩ năng cho bản thân.'
					icon={<User className='h-10 w-10' />}
					isSelected={selectedType === 'student'}
					onSelect={() => onSelectType('student')}
					imageSrc='/images/boy.svg'
				/>

				<AccountTypeCard
					type='tutor'
					title='Giảng viên'
					description='Bạn là Giảng Viên và muốn tìm thêm một công việc thu nhập cao.'
					icon={<GraduationCap className='h-10 w-10' />}
					isSelected={selectedType === 'tutor'}
					onSelect={() => onSelectType('tutor')}
					imageSrc='/images/woman.svg'
				/>
			</div>

			<div className='w-full flex justify-center items-center'>
				<Button variant='secondary' className='w-80 mx-auto' disabled={!selectedType} onClick={onContinue}>
					Tiếp tục
				</Button>
			</div>
		</div>
	);
}

interface AccountTypeCardProps {
	type: AccountType;
	title: string;
	description: string;
	icon: React.ReactNode;
	isSelected: boolean;
	onSelect: () => void;
	imageSrc: string;
}

function AccountTypeCard({ type, title, description, icon, isSelected, onSelect, imageSrc }: AccountTypeCardProps) {
	return (
		<div
			className={`relative cursor-pointer rounded-lg border-2 overflow-hidden shadow-md border-b-4 active:border-b-0 transition-colors ${
				isSelected ? 'border-primary' : 'border-gray-200'
			}`}
			onClick={onSelect}
		>
			{isSelected && (
				<div className='absolute top-2 right-2 bg-primary rounded-full p-2 z-10'>
					<Check className='h-4 w-4 text-white' />
				</div>
			)}

			<div className='relative h-80 w-full'>
				<Image
					src={imageSrc || '/placeholder.svg'}
					alt={title}
					className={`object-contain mx-auto ${
						title === 'Giảng viên' ? 'h-80 -top-6' : 'h-72 -top-10'
					}  absolute left-1/2 -translate-x-1/2`}
					width={200}
					height={200}
				/>
				<div className='absolute top-1/2 left-0 flex flex-col items-start justify-center p-4 text-default'>
					<div className='rounded-full mb-3'>{icon}</div>
					<h3 className='text-xl font-bold'>{title}</h3>
					<p className='text-sm mt-2'>{description}</p>
				</div>
			</div>
		</div>
	);
}
