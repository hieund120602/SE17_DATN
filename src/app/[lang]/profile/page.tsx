'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, CreditCardIcon, BookOpenIcon, TrendingUpIcon, User2Icon, CrownIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { vi, ja } from 'date-fns/locale';
import ClientOnly from '@/components/client-only';
import { useDictionary } from '@/hooks/use-dictionary';

import UserService from '@/services/user-service';
import EnrollmentService from '@/services/enrollment-service';
import PaymentHistoryService, { PaymentHistoryResponse } from '@/services/payment-history-service';

import CertificateDisplay from '@/components/certificate-display';
import CertificateService from '@/services/certificate-service';

// Define fallback translations
const fallbackDict = {
	profile: {
		welcomeMessage: 'Chào mừng, {name}! 👋',
		welcomeSubtitle: 'Tiếp tục hành trình học tập tiếng Nhật của bạn',
		accessDenied: 'Truy cập bị từ chối',
		loginRequired: 'Bạn cần đăng nhập với tài khoản học viên để truy cập trang này.',
		stats: {
			enrolledCourses: 'Khóa học đã đăng ký',
			averageProgress: 'Tiến độ trung bình',
			completedCourses: 'Khóa học hoàn thành',
			totalSpent: 'Tổng chi tiêu',
		},
		tabs: {
			overview: 'Tổng quan',
			courses: 'Khóa học',
			payments: 'Thanh toán',
			profile: 'Hồ sơ',
		},
		overview: {
			recentCourses: 'Khóa học gần đây',
			recentCoursesDesc: 'Tiếp tục học từ nơi bạn đã dừng lại',
			noCoursesInProgress: 'Chưa có khóa học nào đang học',
			percentComplete: '% hoàn thành',
			continue: 'Tiếp tục',
			achievements: 'Thành tích',
			achievementsDesc: 'Các cột mốc bạn đã đạt được',
			activeLearner: 'Người học tích cực',
			activeLearnerDesc: 'Đã học {count} khóa học',
			completer: 'Người hoàn thành',
			completerDesc: 'Hoàn thành {count} khóa học',
			persistent: 'Người kiên trì',
			persistentDesc: 'Tiến độ trung bình trên 50%',
		},
		courses: {
			inProgress: 'Đang học',
			completed: 'Hoàn thành',
			continueLearning: 'Tiếp tục học',
			reviewCourse: 'Xem lại',
			certificate: 'Chứng chỉ',
		},
		payments: {
			paymentHistory: 'Lịch sử thanh toán',
			paymentHistoryDesc: 'Tất cả các giao dịch thanh toán của bạn',
			noTransactions: 'Chưa có giao dịch nào',
			transaction: 'Giao dịch',
			loading: 'Đang tải...',
			status: {
				completed: 'Thành công',
				pending: 'Đang xử lý',
				failed: 'Thất bại',
				cancelled: 'Đã hủy',
			},
		},
		info: {
			personalInfo: 'Thông tin cá nhân',
			personalInfoDesc: 'Quản lý thông tin tài khoản của bạn',
			fullName: 'Họ và tên',
			email: 'Email',
			phoneNumber: 'Số điện thoại',
			phoneNotUpdated: 'Chưa cập nhật',
			joinDate: 'Ngày tham gia',
			editProfile: 'Chỉnh sửa hồ sơ',
		},
	},
	user: {
		login: 'Đăng nhập',
	},
	certificates: {
		title: 'Chứng chỉ',
	},
};

function StudentDashboardContent() {
	const { user, isLoading: authLoading } = useAuth();
	const [activeTab, setActiveTab] = useState('overview');
	const params = useParams();
	const lang = params.lang as string;

	// Dictionary for translations - with error handling
	const { data: dictData, isLoading: dictLoading, error: dictError } = useDictionary(lang);

	// Use fallback dictionary if loading fails or data is not available
	const dict = dictData && dictData.profile ? dictData : fallbackDict;

	// User data query
	const { data: userData, isLoading: userLoading } = useQuery({
		queryKey: ['currentUser'],
		queryFn: UserService.getCurrentUser,
		enabled: !!user,
	});

	// Enrollments query
	const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
		queryKey: ['myEnrollments'],
		queryFn: EnrollmentService.getMyEnrollments,
		enabled: !!user,
	});

	// Payment history query
	const { data: paymentHistory = [], isLoading: paymentLoading } = useQuery({
		queryKey: ['myPaymentHistory'],
		queryFn: PaymentHistoryService.getMyPaymentHistory,
		enabled: !!user && user.roles?.includes('ROLE_STUDENT'),
	});

	// Certificates query
	const { data: myCertificatesResp, isLoading: certsLoading } = useQuery({
		queryKey: ['myCertificates', user?.id],
		queryFn: () => CertificateService.getMyCertificates(0, 30),
		enabled: !!user && user.roles?.includes('ROLE_STUDENT'),
	});

	const completedCourses = enrollments.filter((e: any) => e.completed);
	const inProgressCourses = enrollments.filter((e: any) => !e.completed);
	const totalSpent = paymentHistory.reduce((sum, payment) => {
		const pricePaid =
			typeof payment.pricePaid === 'number' && !isNaN(payment.pricePaid)
				? payment.pricePaid
				: typeof payment.amount === 'number' && !isNaN(payment.amount)
				? payment.amount
				: 0;
		return sum + pricePaid;
	}, 0);
	const averageProgress =
		enrollments.length > 0
			? enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length
			: 0;

	// Get the appropriate locale for date formatting
	const dateLocale = lang === 'jp' ? ja : vi;

	// Only show loading while auth and user data are loading
	// Don't wait for dictionary anymore since we have fallbacks
	if (authLoading || userLoading) {
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
				{/* Header Section */}
				<div className='mb-8'>
					<div className='flex items-center space-x-4'>
						<Avatar className='h-20 w-20'>
							<AvatarImage src={userData?.avatarUrl || undefined} alt={userData?.fullName} />
							<AvatarFallback className='text-2xl'>
								{userData?.fullName?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<h1 className='text-3xl font-bold text-gray-900'>
								{dict.profile.welcomeMessage.replace('{name}', userData?.fullName || '')}
							</h1>
							<p className='text-gray-600 mt-1'>{dict.profile.welcomeSubtitle}</p>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center'>
								<BookOpenIcon className='h-8 w-8 text-blue-600' />
								<div className='ml-4'>
									<p className='text-sm font-medium text-gray-500'>
										{dict.profile.stats.enrolledCourses}
									</p>
									<p className='text-2xl font-bold'>{enrollments.length}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center'>
								<TrendingUpIcon className='h-8 w-8 text-green-600' />
								<div className='ml-4'>
									<p className='text-sm font-medium text-gray-500'>
										{dict.profile.stats.averageProgress}
									</p>
									<p className='text-2xl font-bold'>{averageProgress.toFixed(0)}%</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center'>
								<CrownIcon className='h-8 w-8 text-yellow-600' />
								<div className='ml-4'>
									<p className='text-sm font-medium text-gray-500'>
										{dict.profile.stats.completedCourses}
									</p>
									<p className='text-2xl font-bold'>{completedCourses.length}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='pt-6'>
							<div className='flex items-center'>
								<CreditCardIcon className='h-8 w-8 text-purple-600' />
								<div className='ml-4'>
									<p className='text-sm font-medium text-gray-500'>{dict.profile.stats.totalSpent}</p>
									<ClientOnly fallback={<p className='text-2xl font-bold'>0 VND</p>}>
										<p className='text-2xl font-bold'>{totalSpent.toLocaleString('vi-VN')} VND</p>
									</ClientOnly>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
					<TabsList className='grid w-full grid-cols-5'>
						<TabsTrigger value='overview'>{dict.profile.tabs.overview}</TabsTrigger>
						<TabsTrigger value='courses'>{dict.profile.tabs.courses}</TabsTrigger>
						<TabsTrigger value='payments'>{dict.profile.tabs.payments}</TabsTrigger>
						<TabsTrigger value='certificates'>{dict.profile.tabs.certificates}</TabsTrigger>
						<TabsTrigger value='profile'>{dict.profile.tabs.profile}</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value='overview' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Recent Courses */}
							<Card>
								<CardHeader>
									<CardTitle>{dict.profile.overview.recentCourses}</CardTitle>
									<CardDescription>{dict.profile.overview.recentCoursesDesc}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{inProgressCourses.slice(0, 3).map((enrollment) => (
											<div key={enrollment.id} className='flex items-center space-x-4'>
												<div className='flex-1'>
													<h4 className='font-semibold text-sm'>{enrollment.course.title}</h4>
													<p className='text-xs text-gray-500'>
														{enrollment.progressPercentage || 0}
														{dict.profile.overview.percentComplete}
													</p>
													<Progress
														value={enrollment.progressPercentage || 0}
														className='mt-2'
													/>
												</div>
												<Button size='sm' asChild>
													<Link href={`/${lang}/learning/courses/${enrollment.course.id}`}>
														{dict.profile.overview.continue}
													</Link>
												</Button>
											</div>
										))}
										{inProgressCourses.length === 0 && (
											<p className='text-gray-500 text-center py-4'>
												{dict.profile.overview.noCoursesInProgress}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Achievements */}
							<Card>
								<CardHeader>
									<CardTitle>{dict.profile.overview.achievements}</CardTitle>
									<CardDescription>{dict.profile.overview.achievementsDesc}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='font-medium'>{dict.profile.overview.activeLearner}</p>
												<p className='text-sm text-gray-500'>
													{dict.profile.overview.activeLearnerDesc.replace(
														'{count}',
														enrollments.length.toString()
													)}
												</p>
											</div>
											<Badge variant='secondary'>🎯</Badge>
										</div>

										{completedCourses.length > 0 && (
											<div className='flex items-center justify-between'>
												<div>
													<p className='font-medium'>{dict.profile.overview.completer}</p>
													<p className='text-sm text-gray-500'>
														{dict.profile.overview.completerDesc.replace(
															'{count}',
															completedCourses.length.toString()
														)}
													</p>
												</div>
												<Badge variant='secondary'>🏆</Badge>
											</div>
										)}

										{averageProgress >= 50 && (
											<div className='flex items-center justify-between'>
												<div>
													<p className='font-medium'>{dict.profile.overview.persistent}</p>
													<p className='text-sm text-gray-500'>
														{dict.profile.overview.persistentDesc}
													</p>
												</div>
												<Badge variant='secondary'>⭐</Badge>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Courses Tab */}
					<TabsContent value='courses' className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{enrollments.map((enrollment: any) => (
								<Card key={enrollment.id}>
									<CardContent className='pt-6'>
										<div className='flex items-start space-x-4'>
											<img
												src={enrollment.course.thumbnailUrl}
												alt={enrollment.course.title}
												className='w-16 h-16 rounded-lg object-cover'
											/>
											<div className='flex-1'>
												<h3 className='font-semibold'>{enrollment.course.title}</h3>
												<p className='text-sm text-gray-500 mb-2'>
													{enrollment.course.tutor?.fullName}
												</p>
												<div className='flex items-center justify-between mb-2'>
													<Badge variant={enrollment.completed ? 'default' : 'secondary'}>
														{enrollment.completed
															? dict.profile.courses.completed
															: dict.profile.courses.inProgress}
													</Badge>
													<span className='text-sm text-gray-500'>
														{enrollment.progressPercentage || 0}%
													</span>
												</div>
												<Progress value={enrollment.progressPercentage || 0} className='mb-3' />
												<div className='flex space-x-2'>
													<Button size='sm' asChild>
														<Link
															href={`/${lang}/learning/courses/${enrollment.course.id}`}
														>
															{enrollment.completed
																? dict.profile.courses.reviewCourse
																: dict.profile.courses.continueLearning}
														</Link>
													</Button>
													{enrollment.completed && enrollment.certificateUrl && (
														<Button size='sm' variant='superOutline' asChild>
															<Link href={enrollment.certificateUrl} target='_blank'>
																{dict.profile.courses.certificate}
															</Link>
														</Button>
													)}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					{/* Certificates Tab */}
					<TabsContent value='certificates' className='space-y-6'>
						{certsLoading ? (
							<div className='flex justify-center py-12'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
							</div>
						) : (
							<CertificateDisplay certificates={myCertificatesResp?.content || []} dict={dict} />
						)}
					</TabsContent>

					{/* Payments Tab */}
					<TabsContent value='payments' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>{dict.profile.payments.paymentHistory}</CardTitle>
								<CardDescription>{dict.profile.payments.paymentHistoryDesc}</CardDescription>
							</CardHeader>
							<CardContent>
								{paymentLoading ? (
									<div className='flex justify-center py-8'>
										<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
									</div>
								) : paymentHistory.length === 0 ? (
									<p className='text-center text-gray-500 py-8'>
										{dict.profile.payments.noTransactions}
									</p>
								) : (
									<div className='space-y-4'>
										{paymentHistory.map((payment) => (
											<div
												key={payment.id}
												className='flex items-center justify-between p-4 border rounded-lg'
											>
												<div>
													<p className='font-medium'>
														{payment.courseName ||
															payment.comboName ||
															dict.profile.payments.transaction}
													</p>
													<ClientOnly
														fallback={
															<p className='text-sm text-gray-500'>
																{dict.profile.payments.loading}
															</p>
														}
													>
														<p className='text-sm text-gray-500'>
															{format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm', {
																locale: dateLocale,
															})}
														</p>
													</ClientOnly>
													<p className='text-xs text-gray-400'>ID: {payment.transactionId}</p>
												</div>
												<div className='text-right'>
													<ClientOnly fallback={<p className='font-semibold'>0 VND</p>}>
														<p className='font-semibold'>
															{(typeof payment.pricePaid === 'number' &&
															!isNaN(payment.pricePaid)
																? payment.pricePaid
																: typeof payment.amount === 'number' &&
																  !isNaN(payment.amount)
																? payment.amount
																: 0
															).toLocaleString('vi-VN')}{' '}
															VND
														</p>
													</ClientOnly>
													<Badge
														variant={
															payment.status === 'COMPLETED'
																? 'default'
																: payment.status === 'PENDING'
																? 'secondary'
																: 'destructive'
														}
													>
														{payment.status === 'COMPLETED'
															? dict.profile.payments.status.completed
															: payment.status === 'PENDING'
															? dict.profile.payments.status.pending
															: payment.status === 'FAILED'
															? dict.profile.payments.status.failed
															: dict.profile.payments.status.cancelled}
													</Badge>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Profile Tab */}
					<TabsContent value='profile' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>{dict.profile.info.personalInfo}</CardTitle>
								<CardDescription>{dict.profile.info.personalInfoDesc}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<label className='text-sm font-medium'>{dict.profile.info.fullName}</label>
											<p className='text-lg'>{userData?.fullName}</p>
										</div>
										<div>
											<label className='text-sm font-medium'>{dict.profile.info.email}</label>
											<p className='text-lg'>{userData?.email}</p>
										</div>
										<div>
											<label className='text-sm font-medium'>
												{dict.profile.info.phoneNumber}
											</label>
											<p className='text-lg'>
												{userData?.phoneNumber || dict.profile.info.phoneNotUpdated}
											</p>
										</div>
										<div>
											<label className='text-sm font-medium'>{dict.profile.info.joinDate}</label>
											<ClientOnly
												fallback={<p className='text-lg'>{dict.profile.payments.loading}</p>}
											>
												<p className='text-lg'>
													{userData?.createdAt &&
														format(new Date(userData.createdAt), 'dd/MM/yyyy', {
															locale: dateLocale,
														})}
												</p>
											</ClientOnly>
										</div>
									</div>
									<div className='pt-4'>
										<Button asChild>
											<Link href={`/${lang}/profile/edit`}>{dict.profile.info.editProfile}</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default function StudentDashboard() {
	return (
		<ClientOnly
			fallback={
				<div className='flex items-center justify-center min-h-screen'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			}
		>
			<StudentDashboardContent />
		</ClientOnly>
	);
}
