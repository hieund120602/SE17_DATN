'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import NewsletterService, { NewsletterSubscriptionRequest } from '@/services/newsletter-service';

interface NewsletterSubscriptionProps {
	variant?: 'minimal' | 'card' | 'inline';
	className?: string;
	title?: string;
	description?: string;
	placeholder?: string;
	buttonText?: string;
	showNameField?: boolean;
	showInterests?: boolean;
	showLanguage?: boolean;
	defaultLanguage?: 'vi' | 'en' | 'jp';
}

const interestOptions = [
	{ id: 'japanese-culture', label: 'Văn hóa Nhật Bản', value: 'japanese-culture' },
	{ id: 'language-tips', label: 'Mẹo học ngôn ngữ', value: 'language-tips' },
	{ id: 'course-updates', label: 'Cập nhật khóa học', value: 'course-updates' },
	{ id: 'study-resources', label: 'Tài liệu học tập', value: 'study-resources' },
	{ id: 'promotions', label: 'Khuyến mãi & Ưu đãi', value: 'promotions' },
];

export default function NewsletterSubscription({
	variant = 'minimal',
	className = '',
	title = 'Đăng ký nhận bản tin',
	description = 'Nhận tin tức mới nhất về khóa học và mẹo học tiếng Nhật',
	placeholder = 'Nhập email của bạn...',
	buttonText = 'Đăng ký',
	showNameField = false,
	showInterests = false,
	showLanguage = false,
	defaultLanguage = 'vi',
}: NewsletterSubscriptionProps) {
	const [formData, setFormData] = useState<NewsletterSubscriptionRequest>({
		email: '',
		name: '',
		interests: [],
		language: defaultLanguage,
	});
	const [isSubscribed, setIsSubscribed] = useState(false);

	const subscriptionMutation = useMutation({
		mutationFn: (data: NewsletterSubscriptionRequest) => NewsletterService.subscribe(data),
		onSuccess: (data) => {
			setIsSubscribed(true);
			toast({
				title: 'Đăng ký thành công! 🎉',
				description:
					'Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận để nhận bản tin.',
			});

			// Reset form after success
			setTimeout(() => {
				setFormData({
					email: '',
					name: '',
					interests: [],
					language: defaultLanguage,
				});
				setIsSubscribed(false);
			}, 3000);
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Lỗi đăng ký',
				description: error.response?.data?.message || 'Không thể đăng ký bản tin. Vui lòng thử lại sau.',
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email.trim()) {
			toast({
				variant: 'destructive',
				title: 'Thiếu thông tin',
				description: 'Vui lòng nhập địa chỉ email.',
			});
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			toast({
				variant: 'destructive',
				title: 'Email không hợp lệ',
				description: 'Vui lòng nhập địa chỉ email hợp lệ.',
			});
			return;
		}

		// Filter out empty values
		const cleanData = {
			...formData,
			name: formData.name?.trim() || undefined,
			interests: formData.interests?.length ? formData.interests : undefined,
		};

		subscriptionMutation.mutate(cleanData);
	};

	const handleInterestChange = (interestValue: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			interests: checked
				? [...(prev.interests || []), interestValue]
				: (prev.interests || []).filter((interest) => interest !== interestValue),
		}));
	};

	// Minimal variant (for footer)
	if (variant === 'minimal') {
		return (
			<div className={`space-y-4 ${className}`}>
				<div>
					<h3 className='text-lg font-semibold text-white mb-2'>{title}</h3>
					<p className='text-gray-300 text-sm'>{description}</p>
				</div>

				{isSubscribed ? (
					<div className='flex items-center gap-2 text-green-400'>
						<CheckCircle className='h-5 w-5' />
						<span className='text-sm'>Cảm ơn bạn đã đăng ký!</span>
					</div>
				) : (
					<form onSubmit={handleSubmit} className='flex gap-2'>
						<Input
							type='email'
							placeholder={placeholder}
							value={formData.email}
							onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
							className='flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300'
							disabled={subscriptionMutation.isPending}
						/>
						<Button
							type='submit'
							disabled={subscriptionMutation.isPending}
							className='bg-white text-gray-900 hover:bg-gray-100'
						>
							{subscriptionMutation.isPending ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<Send className='h-4 w-4' />
							)}
						</Button>
					</form>
				)}
			</div>
		);
	}

	// Inline variant
	if (variant === 'inline') {
		return (
			<div className={`flex items-center gap-4 p-4 bg-blue-50 rounded-lg ${className}`}>
				<Mail className='h-8 w-8 text-blue-600 flex-shrink-0' />
				<div className='flex-1'>
					<h4 className='font-semibold text-gray-900'>{title}</h4>
					<p className='text-sm text-gray-600'>{description}</p>
				</div>

				{isSubscribed ? (
					<div className='flex items-center gap-2 text-green-600'>
						<CheckCircle className='h-5 w-5' />
						<span className='text-sm font-medium'>Đã đăng ký!</span>
					</div>
				) : (
					<form onSubmit={handleSubmit} className='flex gap-2'>
						<Input
							type='email'
							placeholder={placeholder}
							value={formData.email}
							onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
							className='w-64'
							disabled={subscriptionMutation.isPending}
						/>
						<Button type='submit' disabled={subscriptionMutation.isPending}>
							{subscriptionMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : buttonText}
						</Button>
					</form>
				)}
			</div>
		);
	}

	// Card variant (full featured)
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Mail className='h-5 w-5' />
					{title}
				</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				{isSubscribed ? (
					<div className='text-center py-8'>
						<CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
						<h3 className='text-xl font-semibold mb-2'>Đăng ký thành công!</h3>
						<p className='text-gray-600'>
							Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận để bắt
							đầu nhận bản tin.
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className='space-y-4'>
						{/* Email Field */}
						<div>
							<Label htmlFor='newsletter-email'>Địa chỉ email *</Label>
							<Input
								id='newsletter-email'
								type='email'
								placeholder={placeholder}
								value={formData.email}
								onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
								disabled={subscriptionMutation.isPending}
								required
							/>
						</div>

						{/* Name Field */}
						{showNameField && (
							<div>
								<Label htmlFor='newsletter-name'>Họ và tên</Label>
								<Input
									id='newsletter-name'
									type='text'
									placeholder='Nhập họ và tên của bạn...'
									value={formData.name}
									onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
									disabled={subscriptionMutation.isPending}
								/>
							</div>
						)}

						{/* Language Selection */}
						{showLanguage && (
							<div>
								<Label htmlFor='newsletter-language'>Ngôn ngữ ưa thích</Label>
								<Select
									value={formData.language}
									onValueChange={(value: any) =>
										setFormData((prev) => ({ ...prev, language: value }))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='vi'>Tiếng Việt</SelectItem>
										<SelectItem value='en'>English</SelectItem>
										<SelectItem value='jp'>日本語</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Interests */}
						{showInterests && (
							<div>
								<Label>Sở thích (chọn những chủ đề bạn quan tâm)</Label>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-2'>
									{interestOptions.map((interest) => (
										<div key={interest.id} className='flex items-center space-x-2'>
											<Checkbox
												id={interest.id}
												checked={formData.interests?.includes(interest.value) || false}
												onCheckedChange={(checked: boolean) =>
													handleInterestChange(interest.value, checked as boolean)
												}
												disabled={subscriptionMutation.isPending}
											/>
											<Label htmlFor={interest.id} className='text-sm font-normal cursor-pointer'>
												{interest.label}
											</Label>
										</div>
									))}
								</div>
							</div>
						)}

						<Button type='submit' className='w-full' disabled={subscriptionMutation.isPending}>
							{subscriptionMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang đăng ký...
								</>
							) : (
								<>
									<Send className='mr-2 h-4 w-4' />
									{buttonText}
								</>
							)}
						</Button>

						<p className='text-xs text-gray-500 text-center'>
							Bằng cách đăng ký, bạn đồng ý nhận email từ chúng tôi. Bạn có thể hủy đăng ký bất cứ lúc
							nào.
						</p>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
