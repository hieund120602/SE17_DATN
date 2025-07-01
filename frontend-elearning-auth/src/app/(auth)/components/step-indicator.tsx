interface StepIndicatorProps {
	currentStep: number;
	totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
	return (
		<div className='relative w-full h-5 bg-gray-200 rounded-full overflow-hidden'>
			<div
				className='absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-in-out rounded-full'
				style={{ width: `${(currentStep / totalSteps) * 100}%` }}
			/>
			<div
				className='absolute top-1/3 left-2 h-[3px] bg-white/20 transition-all rounded-full duration-300 ease-in-out px-2 w-full'
				style={{ width: `${(currentStep / totalSteps) * 100 - 1.5}%` }}
			/>
		</div>
	);
}
