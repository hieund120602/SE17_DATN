import React from 'react';
import Image from 'next/image';
import { CheckCircle, Award, Clock, Users, BookOpen, Sparkles } from 'lucide-react';

interface WhyChooseJPEProps {
	dictionary: any;
}

// Icon components for server-side rendering
const FeatureIcon = ({ type, className }: { type: string; className: string }) => {
	switch (type) {
		case 'award':
			return <Award className={className} />;
		case 'clock':
			return <Clock className={className} />;
		case 'book':
			return <BookOpen className={className} />;
		case 'sparkles':
			return <Sparkles className={className} />;
		case 'check':
			return <CheckCircle className={className} />;
		case 'users':
			return <Users className={className} />;
		default:
			return <Award className={className} />;
	}
};

const WhyChooseJPE = ({ dictionary }: WhyChooseJPEProps) => {
	// Extract dictionary texts with fallbacks
	const t = dictionary?.whyChooseUs || {
		title: 'Why Choose JPE for Japanese Learning?',
		subtitle: 'Discover the JPE advantage for your Japanese language journey',
		certifiedTeachers: {
			title: 'Certified Teachers',
			description: 'Learn from JLPT-certified instructors with years of teaching experience',
		},
		quickProgress: {
			title: 'Quick Progress',
			description: 'Our proven methodology helps students pass JLPT in just 3 months',
		},
		flexibleSchedule: {
			title: 'Flexible Schedule',
			description: 'Study anytime, anywhere with our on-demand online platform',
		},
		personalizedLearning: {
			title: 'Personalized Learning',
			description: 'Customized learning paths based on your proficiency and goals',
		},
		practicalApproach: {
			title: 'Practical Approach',
			description: 'Focus on conversational skills you can apply in real-life situations',
		},
		communitySupport: {
			title: 'Community Support',
			description: 'Join a supportive community of Japanese language learners',
		},
	};

	// Define the feature cards with their respective icons
	const features = [
		{
			iconType: 'award',
			iconColor: 'text-primary',
			title: t.certifiedTeachers?.title,
			description: t.certifiedTeachers?.description,
			iconBg: 'bg-primary/10',
			borderColor: 'border-primary/20',
		},
		{
			iconType: 'clock',
			iconColor: 'text-secondary',
			title: t.quickProgress?.title,
			description: t.quickProgress?.description,
			iconBg: 'bg-secondary/10',
			borderColor: 'border-secondary/20',
		},
		{
			iconType: 'book',
			iconColor: 'text-accent',
			title: t.flexibleSchedule?.title,
			description: t.flexibleSchedule?.description,
			iconBg: 'bg-accent/10',
			borderColor: 'border-accent/20',
		},
		{
			iconType: 'sparkles',
			iconColor: 'text-primary',
			title: t.personalizedLearning?.title,
			description: t.personalizedLearning?.description,
			iconBg: 'bg-primary/10',
			borderColor: 'border-primary/20',
		},
		{
			iconType: 'check',
			iconColor: 'text-secondary',
			title: t.practicalApproach?.title,
			description: t.practicalApproach?.description,
			iconBg: 'bg-secondary/10',
			borderColor: 'border-secondary/20',
		},
		{
			iconType: 'users',
			iconColor: 'text-accent',
			title: t.communitySupport?.title,
			description: t.communitySupport?.description,
			iconBg: 'bg-accent/10',
			borderColor: 'border-accent/20',
		},
	];

	return (
		<section
			id='why-choose-section'
			className='py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden'
		>
			{/* Background Decorations */}
			<div className='absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl'></div>
			<div className='absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl'></div>
			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 rounded-full blur-3xl'></div>

			<div className='container-lg relative z-10'>
				{/* Section header */}
				<div className='text-center mb-20'>
					<div className='inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6'>
						<span className='text-primary font-medium text-sm'>
							{dictionary.whyChooseUs?.badge || 'Why Choose Us'}
						</span>
					</div>

					<h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight'>{t.title}</h2>

					<p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>{t.subtitle}</p>

					{/* Decorative elements */}
					<div className='flex justify-center mt-8'>
						<div className='w-24 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full'></div>
					</div>
				</div>

				{/* Features grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20'>
					{features.map((feature, index) => (
						<div
							key={index}
							className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 flex flex-col h-full border ${feature.borderColor} hover:border-opacity-50 transform hover:-translate-y-2`}
						>
							<div
								className={`p-4 ${feature.iconBg} rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
							>
								<FeatureIcon type={feature.iconType} className={`h-8 w-8 ${feature.iconColor}`} />
							</div>

							<h3 className='text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300'>
								{feature.title}
							</h3>

							<p className='text-gray-600 flex-grow leading-relaxed'>{feature.description}</p>

							{/* Bottom accent line */}
							<div
								className={`mt-6 h-1 ${feature.iconBg} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
							></div>
						</div>
					))}
				</div>

				{/* CTA Section */}
				<div className='bg-gradient-to-r from-primary via-primary-600 to-secondary rounded-3xl overflow-hidden shadow-2xl'>
					<div className='flex flex-col lg:flex-row'>
						<div className='lg:w-3/5 p-8 md:p-12 text-white relative'>
							{/* Background Pattern */}
							<div className='absolute inset-0 opacity-10'>
								<div className='absolute top-4 right-4 w-20 h-20 border border-white rounded-full'></div>
								<div className='absolute bottom-8 left-8 w-16 h-16 border border-white rounded-full'></div>
								<div className='absolute top-1/2 left-1/4 w-12 h-12 border border-white rounded-full'></div>
							</div>

							<div className='relative z-10'>
								<div className='flex items-center mb-8'>
									<div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 shadow-xl'>
										<Image src='/images/Logo.gif' alt='JPE Logo' width={40} height={40} />
									</div>
									<div>
										<h3 className='text-2xl font-bold'>JPE</h3>
										<p className='text-white/80 text-sm'>Japanese Learning Platform</p>
									</div>
								</div>

								<h4 className='text-2xl md:text-3xl font-bold mb-6 leading-tight'>
									{t.mainBenefit || 'Master Japanese in Just 3 Months'}
								</h4>

								<p className='text-white/90 mb-8 text-lg leading-relaxed'>
									{t.mainDescription ||
										'Join thousands of successful students who achieved JLPT certification and fluency through our comprehensive, interactive learning system.'}
								</p>

								<div className='space-y-4'>
									{[
										'JLPT-certified instructors',
										'Interactive learning materials',
										'24/7 community support',
									].map((benefit, idx) => (
										<div key={idx} className='flex items-start'>
											<CheckCircle className='h-6 w-6 text-white mr-3 flex-shrink-0 mt-0.5' />
											<p className='text-white/90 text-lg'>{benefit}</p>
										</div>
									))}
								</div>

								<div className='mt-8'>
									<button className='bg-white text-primary px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300'>
										Start Learning Today
									</button>
								</div>
							</div>
						</div>

						<div className='lg:w-2/5 relative'>
							<div className='h-64 lg:h-full relative'>
								<Image
									src='/images/choose-image.png'
									alt='Japanese Learning Experience'
									fill
									className='object-cover'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent'></div>

								{/* Floating Elements */}
								<div className='absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-full p-3 animate-float'>
									<Sparkles className='w-6 h-6 text-white' />
								</div>
								<div className='absolute bottom-8 left-8 bg-white/20 backdrop-blur-sm rounded-full p-3 animate-float'>
									<Award className='w-6 h-6 text-white' />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default WhyChooseJPE;
