'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { ArrowLeftIcon, CameraIcon, LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import ClientOnly from '@/components/client-only';
import { useDictionary } from '@/hooks/use-dictionary';

import UserService from '@/services/user-service';
import ProfileService from '@/services/profile-service';

// Fallback dictionary for edit profile
const fallbackEditDict = {
	profileEdit: {
		title: 'Chỉnh sửa hồ sơ',
		subtitle: 'Cập nhật thông tin cá nhân của bạn',
		backToProfile: 'Quay lại',
		avatar: {
			title: 'Ảnh đại diện',
			description: 'Cập nhật ảnh đại diện của bạn',
			clickToChange: 'Nhấp vào biểu tượng camera để thay đổi ảnh',
			fileRequirements: 'Tối đa 5MB, định dạng: JPG, PNG, GIF',
		},
		form: {
			title: 'Thông tin cá nhân',
			description: 'Cập nhật thông tin cơ bản của bạn',
			fullNameLabel: 'Họ và tên *',
			fullNamePlaceholder: 'Nhập họ và tên',
			emailLabel: 'Email *',
			emailPlaceholder: 'Nhập địa chỉ email',
			phoneLabel: 'Số điện thoại',
			phonePlaceholder: 'Nhập số điện thoại',
			updateButton: 'Cập nhật thông tin',
			updating: 'Đang cập nhật...',
			cancelButton: 'Hủy',
		},
		validation: {
			fullNameRequired: 'Họ tên phải có ít nhất 2 ký tự',
			emailInvalid: 'Email không hợp lệ',
			fileTypeInvalid: 'Vui lòng chọn file ảnh hợp lệ',
			fileSizeTooBig: 'Kích thước file không được vượt quá 5MB',
		},
		messages: {
			profileUpdateSuccess: 'Cập nhật thông tin cá nhân thành công',
			profileUpdateError: 'Có lỗi xảy ra khi cập nhật thông tin',
			avatarUpdateSuccess: 'Cập nhật ảnh đại diện thành công',
			avatarUpdateError: 'Có lỗi xảy ra khi cập nhật ảnh đại diện',
		},
	},
	profile: {
		accessDenied: 'Truy cập bị từ chối',
		loginRequired: 'Bạn cần đăng nhập với tài khoản học viên để truy cập trang này.',
	},
	user: {
		login: 'Đăng nhập',
	},
	common: {
		save: 'Thành công',
	},
	errors: {
		failedToLoadDiscussion: 'Lỗi',
	},
};

function EditProfileContent() {
	const { user } = useAuth();
	const params = useParams();
	const lang = params.lang as string;
	const router = useRouter();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	// Dictionary for translations - with fallback
	const { data: dictData, isLoading: dictLoading } = useDictionary(lang);
	const dict = dictData && dictData.profileEdit ? dictData : fallbackEditDict;

	// Create form validation schema with translated messages
	const editProfileSchema = z.object({
		fullName: z.string().min(2, dict.profileEdit.validation.fullNameRequired),
		email: z.string().email(dict.profileEdit.validation.emailInvalid),
		phoneNumber: z.string().optional(),
	});

	type EditProfileFormData = z.infer<typeof editProfileSchema>;

	// User data query
	const { data: userData, isLoading: userLoading } = useQuery({
		queryKey: ['currentUser'],
		queryFn: UserService.getCurrentUser,
		enabled: !!user,
	});

	// Form setup
	const form = useForm<EditProfileFormData>({
		resolver: zodResolver(editProfileSchema),
		defaultValues: {
			fullName: userData?.fullName || '',
			email: userData?.email || '',
			phoneNumber: userData?.phoneNumber || '',
		},
	});

	// Reset form when userData changes
	React.useEffect(() => {
		if (userData) {
			form.reset({
				fullName: userData.fullName,
				email: userData.email,
				phoneNumber: userData.phoneNumber || '',
			});
		}
	}, [userData, form]);

	// Update profile mutation
	const updateProfileMutation = useMutation({
		mutationFn: ProfileService.updateProfile,
		onSuccess: () => {
			toast({
				title: dict.common.save,
				description: dict.profileEdit.messages.profileUpdateSuccess,
			});
			queryClient.invalidateQueries({ queryKey: ['currentUser'] });
			router.push(`/${lang}/profile`);
		},
		onError: (error: any) => {
			toast({
				title: dict.errors.failedToLoadDiscussion,
				description: error.response?.data?.message || dict.profileEdit.messages.profileUpdateError,
				variant: 'destructive',
			});
		},
	});

	// Update avatar mutation
	const updateAvatarMutation = useMutation({
		mutationFn: UserService.updateCurrentUserAvatar,
		onSuccess: () => {
			toast({
				title: dict.common.save,
				description: dict.profileEdit.messages.avatarUpdateSuccess,
			});
			queryClient.invalidateQueries({ queryKey: ['currentUser'] });
			setAvatarPreview(null);
			setIsUploadingAvatar(false);
		},
		onError: (error: any) => {
			toast({
				title: dict.errors.failedToLoadDiscussion,
				description: error.response?.data?.message || dict.profileEdit.messages.avatarUpdateError,
				variant: 'destructive',
			});
			setIsUploadingAvatar(false);
		},
	});

	// Handle form submission
	const onSubmit = (data: EditProfileFormData) => {
		updateProfileMutation.mutate({
			...data,
			phoneNumber: data.phoneNumber || '',
		});
	};

	// Handle avatar change
	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast({
				title: dict.errors.failedToLoadDiscussion,
				description: dict.profileEdit.validation.fileTypeInvalid,
				variant: 'destructive',
			});
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast({
				title: dict.errors.failedToLoadDiscussion,
				description: dict.profileEdit.validation.fileSizeTooBig,
				variant: 'destructive',
			});
			return;
		}

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setAvatarPreview(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		// Upload avatar
		setIsUploadingAvatar(true);
		updateAvatarMutation.mutate(file);
	};

	// Handle avatar click
	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	// Don't wait for dictionary loading since we have fallbacks
	if (userLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (!user || !user.roles?.includes('ROLE_STUDENT')) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Card className='w-96'>
					<CardContent className='pt-6'>
						<div className='text-center'>
							<h2 className='text-2xl font-bold mb-4'>{dict.profile.accessDenied}</h2>
							<p className='text-muted-foreground mb-4'>{dict.profile.loginRequired}</p>
							<Button asChild>
								<Link href={`/${lang}/login`}>{dict.user.login}</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='sec-com'>
			<div className='container-lg'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex items-center space-x-4 mb-4'>
						<Button variant='ghost' size='sm' asChild>
							<Link href={`/${lang}/profile`}>
								<ArrowLeftIcon className='h-4 w-4 mr-2' />
								{dict.profileEdit.backToProfile}
							</Link>
						</Button>
					</div>
					<h1 className='text-3xl font-bold text-gray-900'>{dict.profileEdit.title}</h1>
					<p className='text-gray-600 mt-1'>{dict.profileEdit.subtitle}</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Avatar Section */}
					<div className='lg:col-span-1'>
						<Card>
							<CardHeader>
								<CardTitle>{dict.profileEdit.avatar.title}</CardTitle>
								<CardDescription>{dict.profileEdit.avatar.description}</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex flex-col items-center space-y-4'>
									<div className='relative'>
										<Avatar className='h-32 w-32'>
											<AvatarImage
												src={avatarPreview || userData?.avatarUrl || undefined}
												alt={userData?.fullName}
											/>
											<AvatarFallback className='text-4xl'>
												{userData?.fullName?.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<Button
											size='sm'
											className='absolute bottom-0 right-0 rounded-full h-8 w-8 p-0'
											onClick={handleAvatarClick}
											disabled={isUploadingAvatar}
										>
											{isUploadingAvatar ? (
												<LoaderIcon className='h-4 w-4 animate-spin' />
											) : (
												<CameraIcon className='h-4 w-4' />
											)}
										</Button>
									</div>
									<input
										type='file'
										ref={fileInputRef}
										onChange={handleAvatarChange}
										accept='image/*'
										className='hidden'
									/>
									<div className='text-center'>
										<p className='text-sm text-gray-500'>{dict.profileEdit.avatar.clickToChange}</p>
										<p className='text-xs text-gray-400 mt-1'>
											{dict.profileEdit.avatar.fileRequirements}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Form Section */}
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle>{dict.profileEdit.form.title}</CardTitle>
								<CardDescription>{dict.profileEdit.form.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
										<FormField
											control={form.control}
											name='fullName'
											render={({ field }) => (
												<FormItem>
													<FormLabel>{dict.profileEdit.form.fullNameLabel}</FormLabel>
													<FormControl>
														<Input
															placeholder={dict.profileEdit.form.fullNamePlaceholder}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='email'
											render={({ field }) => (
												<FormItem>
													<FormLabel>{dict.profileEdit.form.emailLabel}</FormLabel>
													<FormControl>
														<Input
															type='email'
															placeholder={dict.profileEdit.form.emailPlaceholder}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='phoneNumber'
											render={({ field }) => (
												<FormItem>
													<FormLabel>{dict.profileEdit.form.phoneLabel}</FormLabel>
													<FormControl>
														<Input
															type='tel'
															placeholder={dict.profileEdit.form.phonePlaceholder}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className='flex space-x-4 pt-6'>
											<Button
												type='submit'
												disabled={updateProfileMutation.isPending}
												className='flex-1'
											>
												{updateProfileMutation.isPending ? (
													<>
														<LoaderIcon className='h-4 w-4 mr-2 animate-spin' />
														{dict.profileEdit.form.updating}
													</>
												) : (
													dict.profileEdit.form.updateButton
												)}
											</Button>
											<Button type='button' variant='secondary' asChild>
												<Link href={`/${lang}/profile`}>
													{dict.profileEdit.form.cancelButton}
												</Link>
											</Button>
										</div>
									</form>
								</Form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function EditProfile() {
	return (
		<ClientOnly
			fallback={
				<div className='flex items-center justify-center min-h-screen'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			}
		>
			<EditProfileContent />
		</ClientOnly>
	);
}
