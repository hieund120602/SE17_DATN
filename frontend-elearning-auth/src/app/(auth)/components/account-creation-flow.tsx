'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import StepIndicator from '@/app/(auth)/components/step-indicator';
import AccountTypeStep from '@/app/(auth)/components/account-type-step';
import AccountDetailsStep from '@/app/(auth)/components/account-details-step';
import TutorProfileStep from '@/app/(auth)/components/tutor-profile-step';
import WorkExperienceStep from '@/app/(auth)/components/work-experience-step';
import Link from 'next/link';
import { useTutorRegistrationStore } from '@/store/tutor-registration-store';

export type AccountType = 'student' | 'tutor' | null;

export default function AccountCreationFlow() {
	const [currentStep, setCurrentStep] = useState(1);
	const [selectedAccountType, setSelectedAccountType] = useState<AccountType>('student');
	const resetStore = useTutorRegistrationStore((state) => state.reset);

	// Reset store when component mounts to ensure clean state
	useEffect(() => {
		resetStore();
	}, [resetStore]);

	const getTotalSteps = () => {
		return selectedAccountType === 'tutor' ? 5 : 3;
	};

	const totalSteps = getTotalSteps();

	const goToNextStep = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const goToPreviousStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleAccountTypeSelect = (type: AccountType) => {
		setSelectedAccountType(type);
	};

	const handleComplete = () => {
		// Move to the final success step (step 5)
		goToNextStep();
	};

	return (
		<div className='space-y-6 w-full'>
			<div className='flex flex-col gap-1'>
				<div className='flex items-center justify-between w-full'>
					<Button
						variant='ghost'
						size='icon'
						onClick={goToPreviousStep}
						disabled={currentStep === 1}
						className='justify-start w-fit px-2'
					>
						<ChevronLeft className='h-5 w-5' />
						<span>Quay lại</span>
					</Button>
					<div>
						{currentStep}/{getTotalSteps()} bước
					</div>
				</div>

				<StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
			</div>

			<Card className='border-none shadow-none'>
				<CardContent className='p-0'>
					{currentStep === 1 && (
						<AccountTypeStep
							selectedType={selectedAccountType}
							onSelectType={handleAccountTypeSelect}
							onContinue={goToNextStep}
						/>
					)}

					{currentStep === 2 && selectedAccountType && (
						<AccountDetailsStep accountType={selectedAccountType} onContinue={goToNextStep} />
					)}

					{currentStep === 3 && selectedAccountType === 'student' && (
						<div className='p-6 text-center'>
							<h2 className='text-2xl font-bold mb-4'>Xác nhận tài khoản</h2>
							<p className='mb-6'>Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.</p>
							<Link href='/login'>
								<Button className='w-fit' variant='secondary'>
									Hoàn thành
								</Button>
							</Link>
						</div>
					)}

					{currentStep === 3 && selectedAccountType === 'tutor' && (
						<TutorProfileStep onContinue={goToNextStep} onBack={goToPreviousStep} />
					)}

					{currentStep === 4 && selectedAccountType === 'tutor' && (
						<WorkExperienceStep onContinue={handleComplete} onBack={goToPreviousStep} />
					)}

					{currentStep === 5 && selectedAccountType === 'tutor' && (
						<div className='p-6 text-center'>
							<h2 className='text-2xl font-bold mb-4'>Đăng ký thành công</h2>
							<p className='mb-6'>
								Tài khoản giảng viên của bạn đã được tạo. <br /> Vui lòng đợi thông báo mail từ Japanese
								Learning Platform
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
