'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import UserService, { User } from '@/services/user-service';
import TutorService, { Education, Experience, UpdateTutorProfileRequest } from '@/services/tutor-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
	Camera,
	CheckCircle,
	Award,
	Briefcase,
	GraduationCap,
	Plus,
	Eye,
	EyeOff,
	Save,
	Upload,
	Trash,
	Edit,
	X,
} from 'lucide-react';
import AnimatedTab from '@/components/animated-tab';
import ProfileService from '@/services/profile-service';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface UpdatedUserData {
	fullName: string;
	phoneNumber: string;
	email: string;
	teachingRequirements?: string;
}

const emptyEducation: Education = {
	institution: '',
	degree: '',
	fieldOfStudy: '',
	startDate: '',
	endDate: '',
	description: '',
	id: '',
};

const emptyExperience: Experience = {
	company: '',
	position: '',
	startDate: '',
	endDate: '',
	description: '',
	current: false,
	id: '',
};

// Helper function to format date as yyyy-MM-dd
const formatDateForDisplay = (dateString: string | undefined): string => {
	if (!dateString) return 'Hiện tại';

	// If the date is already in yyyy-MM-dd format, return it as is
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
		return dateString;
	}

	// If it's only year-month, add day
	if (/^\d{4}-\d{2}$/.test(dateString)) {
		return `${dateString}-01`;
	}

	// For other formats, try to parse and format
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;

		return date.toISOString().split('T')[0];
	} catch (e) {
		return dateString;
	}
};

// Helper function to format date as yyyy-MM-dd for input fields
const formatDateForInput = (dateString: string | undefined): string => {
	if (!dateString) return '';
	return formatDateForDisplay(dateString);
};

const ProfilePage: React.FC = () => {
	const { refetchUser } = useAuth();
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [updatedUser, setUpdatedUser] = useState<UpdatedUserData>({
		fullName: '',
		phoneNumber: '',
		email: '',
		teachingRequirements: '',
	});
	const [avatarPreview, setAvatarPreview] = useState<string>('');
	const [isUpdating, setIsUpdating] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState(1);

	// Education state
	const [educations, setEducations] = useState<Education[]>([]);
	const [showEducationDialog, setShowEducationDialog] = useState(false);
	const [currentEducation, setCurrentEducation] = useState<Education>({ ...emptyEducation });
	const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);

	// Experience state
	const [experiences, setExperiences] = useState<Experience[]>([]);
	const [showExperienceDialog, setShowExperienceDialog] = useState(false);
	const [currentExperience, setCurrentExperience] = useState<Experience>({ ...emptyExperience });
	const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);

	useEffect(() => {
		const fetchUserProfile = async (): Promise<void> => {
			try {
				const userData = await UserService.getCurrentUser();
				setUser(userData);
				setUpdatedUser({
					fullName: userData.fullName || '',
					phoneNumber: userData.phoneNumber || '',
					email: userData.email || '',
					teachingRequirements: userData.teachingRequirements || '',
				});

				// Set educations and experiences if they exist
				if (userData.educations && Array.isArray(userData.educations)) {
					setEducations(userData.educations);
				}

				if (userData.experiences && Array.isArray(userData.experiences)) {
					setExperiences(userData.experiences);
				}

				setLoading(false);
			} catch (error) {
				console.error('Error fetching user profile:', error);
				toast.error('Không thể tải thông tin người dùng');
				setLoading(false);
			}
		};

		fetchUserProfile();
	}, []);

	const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files;
		if (files && files[0]) {
			const file = files[0];
			setAvatarFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result;
				if (typeof result === 'string') {
					setAvatarPreview(result);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	// Update both local state and global auth context
	const refreshUserData = async () => {
		// Invalidate and refetch the currentUser query to update the global state
		await queryClient.invalidateQueries({ queryKey: ['currentUser'] });

		// Trigger the refetch in AuthContext
		await refetchUser();

		// Update the local user state
		const freshUserData = await UserService.getCurrentUser();
		setUser(freshUserData);

		return freshUserData;
	};

	const handleUpdateAvatar = async (): Promise<void> => {
		if (!avatarFile) {
			toast.error('Vui lòng chọn ảnh đại diện');
			return;
		}

		setIsUpdating(true);
		try {
			// Update the avatar
			await UserService.updateCurrentUserAvatar(avatarFile);

			// Refresh the user data globally and locally
			await refreshUserData();

			setAvatarFile(null);
			toast.success('Cập nhật ảnh đại diện thành công!');
		} catch (error) {
			console.error('Error updating avatar:', error);
			toast.error('Không thể cập nhật ảnh đại diện');
		} finally {
			setIsUpdating(false);
		}
	};

	// Mutation for updating tutor profile
	const updateTutorProfileMutation = useMutation({
		mutationFn: async (data: UpdateTutorProfileRequest) => {
			return TutorService.updateProfile(data);
		},
		onSuccess: async () => {
			await refreshUserData();
			setEditMode(false);
			toast.success('Hồ sơ giảng viên đã được cập nhật thành công!');
		},
		onError: (error) => {
			console.error('Error updating tutor profile:', error);
			toast.error('Không thể cập nhật hồ sơ giảng viên');
		},
	});

	// Mutation for updating regular user profile
	const updateProfileMutation = useMutation({
		mutationFn: ProfileService.updateProfile,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['profile'] });
			setEditMode(false);
			toast.success('Hồ sơ đã được cập nhật thành công!');
		},
		onError: (error) => {
			console.error('Error updating profile:', error);
			toast.error('Không thể cập nhật hồ sơ');
		},
	});

	const handleUpdateProfile = async (): Promise<void> => {
		// Check if the user is a tutor
		if (user?.roles?.includes('ROLE_TUTOR')) {
			// Prepare tutor profile data with educations and experiences
			const tutorProfileData: UpdateTutorProfileRequest = {
				fullName: updatedUser.fullName,
				email: updatedUser.email,
				phoneNumber: updatedUser.phoneNumber,
				teachingRequirements: updatedUser.teachingRequirements,
				educations: educations,
				experiences: experiences,
			};

			// Use TutorService to update tutor profile
			updateTutorProfileMutation.mutate(tutorProfileData);
		} else {
			// For regular users, just update basic profile
			updateProfileMutation.mutate({
				fullName: updatedUser.fullName,
				phoneNumber: updatedUser.phoneNumber,
				email: updatedUser.email,
			});
		}

		// If there's a new avatar, upload it after updating the profile
		if (avatarFile) {
			handleUpdateAvatar();
		}
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
		const { name, value } = e.target;
		setUpdatedUser((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Find the next available ID for education entries
	const getNextEducationId = (): number => {
		if (!educations || educations.length === 0) return 1;

		// Find the highest ID from existing educations
		const maxId = Math.max(...educations.map((edu) => edu.id || 0));
		return maxId + 1;
	};

	// Find the next available ID for experience entries
	const getNextExperienceId = (): number => {
		if (!experiences || experiences.length === 0) return 1;

		// Find the highest ID from existing experiences
		const maxId = Math.max(...experiences.map((exp) => exp.id || 0));
		return maxId + 1;
	};

	// Education handlers
	const openAddEducationDialog = () => {
		setCurrentEducation({ ...emptyEducation });
		setEditingEducationIndex(null);
		setShowEducationDialog(true);
	};

	const openEditEducationDialog = (index: number) => {
		setCurrentEducation({ ...educations[index] });
		setEditingEducationIndex(index);
		setShowEducationDialog(true);
	};

	const handleEducationChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setCurrentEducation((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSaveEducation = () => {
		// Validate required fields
		if (!currentEducation.institution || !currentEducation.degree || !currentEducation.startDate) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		// Ensure date format is yyyy-MM-dd
		const formattedEducation = {
			...currentEducation,
			startDate: formatDateForDisplay(currentEducation.startDate),
			endDate: currentEducation.endDate ? formatDateForDisplay(currentEducation.endDate) : undefined,
		};

		const newEducations = [...educations];

		if (editingEducationIndex !== null) {
			// Edit existing education
			newEducations[editingEducationIndex] = formattedEducation;
		} else {
			// Add new education with auto-generated ID
			const newEducation = {
				...formattedEducation,
				id: getNextEducationId(),
			};
			newEducations.push(newEducation);
		}

		setEducations(newEducations);
		setShowEducationDialog(false);
	};

	const handleDeleteEducation = (index: number) => {
		if (confirm('Bạn có chắc chắn muốn xóa thông tin học vấn này?')) {
			const newEducations = [...educations];
			newEducations.splice(index, 1);
			setEducations(newEducations);
		}
	};

	// Experience handlers
	const openAddExperienceDialog = () => {
		setCurrentExperience({ ...emptyExperience });
		setEditingExperienceIndex(null);
		setShowExperienceDialog(true);
	};

	const openEditExperienceDialog = (index: number) => {
		const experience = { ...experiences[index] };
		// Check if it's a current position (no end date)
		if (!experience.endDate) {
			experience.current = true;
		}
		setCurrentExperience(experience);
		setEditingExperienceIndex(index);
		setShowExperienceDialog(true);
	};

	const handleExperienceChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setCurrentExperience((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCurrentPositionChange = (checked: boolean) => {
		setCurrentExperience((prev) => ({
			...prev,
			current: checked,
			endDate: checked ? undefined : prev.endDate,
		}));
	};

	const handleSaveExperience = () => {
		// Validate required fields
		if (!currentExperience.company || !currentExperience.position || !currentExperience.startDate) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		const experienceToSave = { ...currentExperience };

		// If current position, remove end date
		if (experienceToSave.current) {
			experienceToSave.endDate = undefined;
		}

		// Format dates
		experienceToSave.startDate = formatDateForDisplay(experienceToSave.startDate);
		if (experienceToSave.endDate) {
			experienceToSave.endDate = formatDateForDisplay(experienceToSave.endDate);
		}

		// Remove the current flag before saving
		const { current, ...experienceWithoutCurrent } = experienceToSave;

		const newExperiences = [...experiences];

		if (editingExperienceIndex !== null) {
			// Edit existing experience
			newExperiences[editingExperienceIndex] = experienceWithoutCurrent;
		} else {
			// Add new experience with auto-generated ID
			const newExperience = {
				...experienceWithoutCurrent,
				id: getNextExperienceId(),
			};
			newExperiences.push(newExperience);
		}

		setExperiences(newExperiences);
		setShowExperienceDialog(false);
	};

	const handleDeleteExperience = (index: number) => {
		if (confirm('Bạn có chắc chắn muốn xóa thông tin kinh nghiệm này?')) {
			const newExperiences = [...experiences];
			newExperiences.splice(index, 1);
			setExperiences(newExperiences);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
			</div>
		);
	}

	return (
		<div className='w-full'>
			{/* Header with profile summary */}
			<div className='bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg mb-8 p-4 sm:p-6 relative overflow-hidden'>
				<div className='absolute right-0 top-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full -mr-16 -mt-16'></div>
				<div className='absolute left-0 bottom-0 w-16 sm:w-32 h-16 sm:h-32 bg-white/10 rounded-full -ml-8 sm:-ml-16 -mb-8 sm:-mb-16'></div>

				<div className='flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10'>
					<div className='relative group flex flex-col items-center'>
						<Avatar className='w-20 h-20 md:w-32 md:h-32 border-4 border-white shadow-xl relative'>
							<AvatarImage
								src={avatarPreview || user?.avatarUrl || '/api/placeholder/150/150'}
								alt={user?.fullName}
							/>
							<AvatarFallback className='text-2xl md:text-4xl bg-white text-primary'>
								{user?.fullName?.charAt(0)}
							</AvatarFallback>
							{editMode && (
								<label className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity'>
									<Camera className='text-white h-6 w-6 md:h-8 md:w-8' />
									<input
										type='file'
										className='hidden'
										accept='image/*'
										onChange={handleAvatarChange}
									/>
								</label>
							)}
						</Avatar>
						{avatarFile && (
							<div className='mt-2 flex justify-center'>
								<Button
									size='sm'
									variant='secondary'
									onClick={handleUpdateAvatar}
									disabled={isUpdating}
								>
									{isUpdating ? (
										<div className='h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2'></div>
									) : (
										<Upload className='mr-2 h-4 w-4' />
									)}
									<span className='hidden xs:inline'>Cập nhật ảnh</span>
								</Button>
							</div>
						)}
					</div>

					<div className='text-center md:text-left text-white'>
						<h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>{user?.fullName}</h1>
						<p className='text-sm md:text-lg text-white/90'>{user?.email}</p>
						<div className='flex flex-wrap gap-2 mt-3 justify-center md:justify-start'>
							{user?.roles?.map((role, index) => (
								<Badge
									key={index}
									className='bg-white/20 text-white border-none hover:bg-white/30 text-xs md:text-sm'
								>
									{role.replace('ROLE_', '')}
								</Badge>
							))}
						</div>
					</div>

					<div className='md:ml-auto mt-4 md:mt-0'>
						<Button
							onClick={() => setEditMode(!editMode)}
							className='font-medium bg-white text-green-600 hover:bg-white/90 text-xs sm:text-sm'
							disabled={isUpdating}
						>
							{editMode ? (
								<>
									<EyeOff className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
									<span className='hidden xs:inline'>Hủy chỉnh sửa</span>
								</>
							) : (
								<>
									<Eye className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
									<span className='hidden xs:inline'>Chỉnh sửa hồ sơ</span>
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className='mb-8'>
				{user?.roles?.includes('ROLE_TUTOR') && (
					<AnimatedTab activeTab={activeTab} setActiveTab={setActiveTab} />
				)}
			</div>

			<div>
				{activeTab === 1 && (
					<Card className='border-none shadow-md rounded-xl overflow-hidden'>
						<CardHeader className='bg-gray-50 p-4 md:p-6'>
							<CardTitle className='flex items-center text-lg md:text-xl'>
								<CheckCircle className='mr-2 h-5 w-5 md:h-6 md:w-6 text-primary' />
								Thông tin cá nhân
							</CardTitle>
							<CardDescription>Thông tin cơ bản của bạn</CardDescription>
						</CardHeader>
						<CardContent className='p-4 md:p-6 space-y-4 md:space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
								<div className='space-y-2'>
									<Label htmlFor='fullName'>Họ và tên</Label>
									{editMode ? (
										<Input
											id='fullName'
											name='fullName'
											value={updatedUser.fullName}
											onChange={handleInputChange}
											className='border-2 focus:border-primary'
										/>
									) : (
										<div className='py-2 px-3 rounded-md bg-gray-50'>{user?.fullName}</div>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									{editMode ? (
										<Input
											id='email'
											name='email'
											value={updatedUser.email}
											onChange={handleInputChange}
											className='border-2 focus:border-primary'
										/>
									) : (
										<div className='py-2 px-3 rounded-md bg-gray-50'>{user?.email}</div>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='phoneNumber'>Số điện thoại</Label>
									{editMode ? (
										<Input
											id='phoneNumber'
											name='phoneNumber'
											value={updatedUser.phoneNumber}
											onChange={handleInputChange}
											className='border-2 focus:border-primary'
										/>
									) : (
										<div className='py-2 px-3 rounded-md bg-gray-50'>
											{user?.phoneNumber || 'Chưa cập nhật'}
										</div>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='userType'>Loại tài khoản</Label>
									<div className='py-2 px-3 rounded-md bg-gray-50 font-medium'>
										{user?.userType === 'ADMIN'
											? 'Quản trị viên'
											: user?.userType === 'TUTOR'
											? 'Giảng viên'
											: 'Học viên'}
									</div>
								</div>
							</div>

							{/* Add teaching requirements field for tutors */}
							{user?.roles?.includes('ROLE_TUTOR') && (
								<div className='space-y-2'>
									<Label htmlFor='teachingRequirements'>Yêu cầu giảng dạy</Label>
									{editMode ? (
										<Textarea
											id='teachingRequirements'
											name='teachingRequirements'
											value={updatedUser.teachingRequirements || ''}
											onChange={handleInputChange}
											className='border-2 focus:border-primary resize-none min-h-[100px]'
											placeholder='Mô tả những yêu cầu đặc biệt khi giảng dạy...'
										/>
									) : (
										<div className='py-2 px-3 rounded-md bg-gray-50 min-h-[60px] whitespace-pre-line'>
											{user?.teachingRequirements || 'Chưa cập nhật'}
										</div>
									)}
								</div>
							)}

							{editMode && (
								<div className='flex justify-end pt-4'>
									<Button
										onClick={handleUpdateProfile}
										variant='primary'
										disabled={
											updateProfileMutation.isPending || updateTutorProfileMutation.isPending
										}
									>
										{updateProfileMutation.isPending || updateTutorProfileMutation.isPending ? (
											<div className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
										) : (
											<Save className='mr-2 h-4 w-4' />
										)}
										Lưu thông tin
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{activeTab === 2 && (
					<Card className='border-none shadow-md rounded-xl overflow-hidden'>
						<CardHeader className='bg-gray-50 p-4 md:p-6'>
							<CardTitle className='flex items-center text-lg md:text-xl'>
								<GraduationCap className='mr-2 h-5 w-5 md:h-6 md:w-6 text-primary' />
								Học vấn
							</CardTitle>
							<CardDescription>Thông tin về quá trình học tập của bạn</CardDescription>
						</CardHeader>
						<CardContent className='p-4 md:p-6'>
							{educations && educations.length > 0 ? (
								<div className='space-y-4 md:space-y-6'>
									{educations.map((edu, index) => (
										<div
											key={index}
											className='p-3 md:p-4 border-2 border-gray-100 rounded-xl bg-white hover:border-primary/30 transition-colors relative group'
										>
											{/* Edit and Delete buttons - visible on hover */}
											{editMode && (
												<div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
													<Button
														size='sm'
														variant='ghost'
														className='h-8 w-8 p-0'
														onClick={() => openEditEducationDialog(index)}
													>
														<Edit className='h-4 w-4 text-blue-500' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														className='h-8 w-8 p-0'
														onClick={() => handleDeleteEducation(index)}
													>
														<Trash className='h-4 w-4 text-red-500' />
													</Button>
												</div>
											)}

											<div className='flex flex-col sm:flex-row sm:justify-between gap-2'>
												<div>
													<h3 className='font-bold text-base md:text-lg'>
														{edu.institution}
													</h3>
													<p className='text-gray-700 text-sm md:text-base'>{edu.degree}</p>
													<p className='text-gray-600 text-sm'>{edu.fieldOfStudy}</p>
													{edu.id && (
														<span className='text-xs text-gray-400'>ID: {edu.id}</span>
													)}
												</div>
												<Badge className='bg-blue-50 text-blue-700 border-blue-200 h-fit text-xs md:text-sm self-start sm:self-auto'>
													{formatDateForDisplay(edu.startDate)} -{' '}
													{edu.endDate ? formatDateForDisplay(edu.endDate) : 'Hiện tại'}
												</Badge>
											</div>
											{edu.description && (
												<p className='mt-3 text-gray-600 text-sm md:text-base'>
													{edu.description}
												</p>
											)}
										</div>
									))}
								</div>
							) : (
								<div className='py-8 md:py-12 text-center'>
									<div className='w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center'>
										<GraduationCap className='h-6 w-6 md:h-8 md:w-8 text-gray-400' />
									</div>
									<h3 className='text-base md:text-lg font-medium text-gray-500 mb-2'>
										Chưa có thông tin học vấn
									</h3>
									<p className='text-sm md:text-base text-gray-400 mb-4'>
										Thêm thông tin về quá trình học tập của bạn
									</p>
									<Button variant='custom' onClick={openAddEducationDialog} disabled={!editMode}>
										<Plus className='mr-2 h-3 w-3 md:h-4 md:w-4' />
										Thêm học vấn
									</Button>
								</div>
							)}

							{/* Add education button when already have items */}
							{educations && educations.length > 0 && editMode && (
								<div className='mt-6 flex justify-center'>
									<Button variant='secondary' onClick={openAddEducationDialog}>
										<Plus className='mr-2 h-4 w-4' />
										Thêm học vấn mới
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{activeTab === 3 && (
					<Card className='border-none shadow-md rounded-xl overflow-hidden'>
						<CardHeader className='bg-gray-50 p-4 md:p-6'>
							<CardTitle className='flex items-center text-lg md:text-xl'>
								<Briefcase className='mr-2 h-5 w-5 md:h-6 md:w-6 text-primary' />
								Kinh nghiệm làm việc
							</CardTitle>
							<CardDescription>Kinh nghiệm chuyên môn và làm việc của bạn</CardDescription>
						</CardHeader>
						<CardContent className='p-4 md:p-6'>
							{experiences && experiences.length > 0 ? (
								<div className='space-y-4 md:space-y-6'>
									{experiences.map((exp, index) => (
										<div
											key={index}
											className='p-3 md:p-4 border-2 border-gray-100 rounded-xl bg-white hover:border-primary/30 transition-colors relative group'
										>
											{/* Edit and Delete buttons - visible on hover */}
											{editMode && (
												<div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
													<Button
														size='sm'
														variant='ghost'
														className='h-8 w-8 p-0'
														onClick={() => openEditExperienceDialog(index)}
													>
														<Edit className='h-4 w-4 text-blue-500' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														className='h-8 w-8 p-0'
														onClick={() => handleDeleteExperience(index)}
													>
														<Trash className='h-4 w-4 text-red-500' />
													</Button>
												</div>
											)}

											<div className='flex flex-col sm:flex-row sm:justify-between gap-2'>
												<div>
													<h3 className='font-bold text-base md:text-lg'>{exp.company}</h3>
													<p className='text-gray-700 font-medium text-sm md:text-base'>
														{exp.position}
													</p>
													{exp.id && (
														<span className='text-xs text-gray-400'>ID: {exp.id}</span>
													)}
												</div>
												<Badge className='bg-blue-50 text-blue-700 border-blue-200 h-fit text-xs md:text-sm self-start sm:self-auto'>
													{formatDateForDisplay(exp.startDate)} -{' '}
													{exp.endDate ? formatDateForDisplay(exp.endDate) : 'Hiện tại'}
												</Badge>
											</div>
											{exp.description && (
												<div className='mt-3'>
													<p className='text-gray-600 whitespace-pre-line text-sm md:text-base'>
														{exp.description}
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<div className='py-8 md:py-12 text-center'>
									<div className='w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center'>
										<Briefcase className='h-6 w-6 md:h-8 md:w-8 text-gray-400' />
									</div>
									<h3 className='text-base md:text-lg font-medium text-gray-500 mb-2'>
										Chưa có thông tin kinh nghiệm
									</h3>
									<p className='text-sm md:text-base text-gray-400 mb-4'>
										Thêm thông tin về kinh nghiệm làm việc của bạn
									</p>
									<Button
										variant='custom'
										className='text-sm md:text-base'
										onClick={openAddExperienceDialog}
										disabled={!editMode}
									>
										<Plus className='mr-2 h-3 w-3 md:h-4 md:w-4' />
										Thêm kinh nghiệm
									</Button>
								</div>
							)}

							{/* Add experience button when already have items */}
							{experiences && experiences.length > 0 && editMode && (
								<div className='mt-6 flex justify-center'>
									<Button variant='secondary' onClick={openAddExperienceDialog}>
										<Plus className='mr-2 h-4 w-4' />
										Thêm kinh nghiệm mới
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>

			{/* Education Dialog */}
			<Dialog open={showEducationDialog} onOpenChange={setShowEducationDialog}>
				<DialogContent className='sm:max-w-[500px]'>
					<DialogHeader>
						<DialogTitle>
							{editingEducationIndex !== null ? 'Chỉnh sửa học vấn' : 'Thêm học vấn mới'}
						</DialogTitle>
						<DialogDescription>Nhập thông tin chi tiết về quá trình học tập của bạn</DialogDescription>
					</DialogHeader>

					<div className='grid gap-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='institution' className='text-right'>
								Tên trường <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='institution'
								name='institution'
								value={currentEducation.institution}
								onChange={handleEducationChange}
								placeholder='Ví dụ: Đại học Bách Khoa TP.HCM'
								className='col-span-3'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='degree' className='text-right'>
								Bằng cấp <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='degree'
								name='degree'
								value={currentEducation.degree}
								onChange={handleEducationChange}
								placeholder='Ví dụ: Cử nhân, Thạc sĩ, Tiến sĩ'
								className='col-span-3'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='fieldOfStudy' className='text-right'>
								Chuyên ngành
							</Label>
							<Input
								id='fieldOfStudy'
								name='fieldOfStudy'
								value={currentEducation.fieldOfStudy}
								onChange={handleEducationChange}
								placeholder='Ví dụ: Công nghệ thông tin, Kinh tế'
								className='col-span-3'
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='startDate' className='text-right'>
									Ngày bắt đầu <span className='text-red-500'>*</span>
								</Label>
								<Input
									id='startDate'
									name='startDate'
									type='date'
									value={formatDateForInput(currentEducation.startDate)}
									onChange={handleEducationChange}
									className='col-span-3'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='endDate' className='text-right'>
									Ngày kết thúc
								</Label>
								<Input
									id='endDate'
									name='endDate'
									type='date'
									value={formatDateForInput(currentEducation.endDate)}
									onChange={handleEducationChange}
									className='col-span-3'
									placeholder='Để trống nếu đang học'
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='description' className='text-right'>
								Mô tả
							</Label>
							<Textarea
								id='description'
								name='description'
								value={currentEducation.description}
								onChange={handleEducationChange}
								placeholder='Mô tả thêm về chương trình học, thành tích...'
								className='col-span-3 min-h-[80px]'
							/>
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant='superOutline'>Hủy</Button>
						</DialogClose>
						<Button onClick={handleSaveEducation} type='submit'>
							Lưu
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Experience Dialog */}
			<Dialog open={showExperienceDialog} onOpenChange={setShowExperienceDialog}>
				<DialogContent className='sm:max-w-[500px]'>
					<DialogHeader>
						<DialogTitle>
							{editingExperienceIndex !== null ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm mới'}
						</DialogTitle>
						<DialogDescription>Nhập thông tin chi tiết về kinh nghiệm làm việc của bạn</DialogDescription>
					</DialogHeader>

					<div className='grid gap-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='company' className='text-right'>
								Tên công ty <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='company'
								name='company'
								value={currentExperience.company}
								onChange={handleExperienceChange}
								placeholder='Ví dụ: Công ty TNHH ABC'
								className='col-span-3'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='position' className='text-right'>
								Vị trí <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='position'
								name='position'
								value={currentExperience.position}
								onChange={handleExperienceChange}
								placeholder='Ví dụ: Giáo viên tiếng Anh, Giảng viên'
								className='col-span-3'
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='startDate' className='text-right'>
									Ngày bắt đầu <span className='text-red-500'>*</span>
								</Label>
								<Input
									id='startDate'
									name='startDate'
									type='date'
									value={formatDateForInput(currentExperience.startDate)}
									onChange={handleExperienceChange}
									className='col-span-3'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='endDate' className='text-right'>
									Ngày kết thúc
								</Label>
								<Input
									id='endDate'
									name='endDate'
									type='date'
									value={formatDateForInput(currentExperience.endDate)}
									onChange={handleExperienceChange}
									className='col-span-3'
									disabled={currentExperience.current}
									placeholder='Để trống nếu đang làm việc'
								/>
							</div>
						</div>

						<div className='flex items-center space-x-2'>
							<Checkbox
								id='current'
								checked={currentExperience.current}
								onCheckedChange={handleCurrentPositionChange}
							/>
							<Label htmlFor='current'>Tôi hiện đang làm việc tại đây</Label>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='description' className='text-right'>
								Mô tả công việc
							</Label>
							<Textarea
								id='description'
								name='description'
								value={currentExperience.description}
								onChange={handleExperienceChange}
								placeholder='Mô tả chi tiết về trách nhiệm và thành tựu của bạn...'
								className='col-span-3 min-h-[100px]'
							/>
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant='superOutline'>Hủy</Button>
						</DialogClose>
						<Button onClick={handleSaveExperience} type='submit'>
							Lưu
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ProfilePage;
