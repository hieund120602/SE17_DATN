# Backend Integration - Services Added

Đây là tài liệu về các service mới được thêm vào frontend để tích hợp với các API endpoints từ backend mà trước đó chưa có.

## Các Service Mới Được Thêm

### 1. StatisticsService (`/src/services/statistics-service.ts`)

Tích hợp với `StatisticsController` từ backend để cung cấp các thống kê:

**API Endpoints:**

-   `GET /statistics/dashboard` - Thống kê tổng quan cho admin dashboard
-   `GET /statistics/payments` - Thống kê thanh toán theo khoảng thời gian
-   `GET /statistics/payments/history` - Lịch sử thanh toán cho admin
-   `GET /statistics/payments/history/course/{courseId}` - Lịch sử thanh toán theo khóa học
-   `GET /statistics/payments/history/tutor` - Lịch sử thanh toán cho tutor hiện tại
-   `GET /statistics/payments/history/tutor/{tutorId}` - Lịch sử thanh toán theo tutor ID

**Chức năng chính:**

-   Lấy thống kê dashboard với các metric quan trọng
-   Thống kê thanh toán theo thời gian với biểu đồ
-   Quản lý lịch sử thanh toán cho admin và tutor

### 2. UserManagementService (`/src/services/user-management-service.ts`)

Tích hợp với `UserManagementController` để quản lý tài khoản người dùng:

**API Endpoints:**

-   `PUT /api/user-management/account/enable/{userId}` - Kích hoạt tài khoản
-   `PUT /api/user-management/account/disable/{userId}` - Vô hiệu hóa tài khoản
-   `PUT /api/user-management/account/block/{userId}` - Chặn tài khoản
-   `PUT /api/user-management/account/unblock/{userId}` - Bỏ chặn tài khoản
-   `PUT /api/user-management/tutor/approve/{tutorId}` - Phê duyệt tutor
-   `PUT /api/user-management/tutor/reject/{tutorId}` - Từ chối tutor
-   `GET /api/user-management/account/status` - Lấy trạng thái tài khoản

**Chức năng chính:**

-   Quản lý trạng thái tài khoản người dùng (enable/disable/block/unblock)
-   Phê duyệt và từ chối đăng ký tutor
-   Kiểm tra trạng thái tài khoản hiện tại

### 3. LearningService (`/src/services/learning-service.ts`)

Tích hợp với `LearningController` cho việc học tập:

**API Endpoints:**

-   `GET /learning/courses/{courseId}` - Lấy khóa học cho việc học với progress
-   `POST /learning/lessons/{lessonId}/complete` - Đánh dấu bài học hoàn thành

**Chức năng chính:**

-   Lấy thông tin khóa học chi tiết với tiến độ học tập
-   Đánh dấu bài học đã hoàn thành
-   Theo dõi tiến độ học tập của học viên

### 4. TutorService (`/src/services/tutor-service.ts`)

Tích hợp với `TutorController` để quản lý chứng chỉ tutor:

**API Endpoints:**

-   `POST /tutors/me/certificates` - Upload chứng chỉ cho tutor hiện tại
-   `DELETE /tutors/me/certificates` - Xóa chứng chỉ của tutor hiện tại
-   `GET /tutors/me/certificates` - Lấy danh sách chứng chỉ của tutor hiện tại
-   `POST /tutors/{tutorId}/certificates` - Admin upload chứng chỉ cho tutor
-   `DELETE /tutors/{tutorId}/certificates` - Admin xóa chứng chỉ của tutor
-   `GET /tutors/{tutorId}/certificates` - Admin lấy chứng chỉ của tutor

**Chức năng chính:**

-   Quản lý chứng chỉ của tutor (upload, xóa, xem)
-   Admin có thể quản lý chứng chỉ của bất kỳ tutor nào

### 5. AdminUserService (`/src/services/admin-user-service.ts`)

Tích hợp với `AdminUserController` cho admin quản lý người dùng:

**API Endpoints:**

-   `GET /admin/users/students` - Lấy danh sách tất cả học viên
-   `GET /admin/users/tutors` - Lấy danh sách tất cả tutor
-   `GET /admin/users/tutors/pending` - Lấy danh sách tutor chờ phê duyệt
-   `PUT /admin/users/tutors/{tutorId}/approve` - Phê duyệt tutor
-   `PUT /admin/users/tutors/{tutorId}/reject` - Từ chối tutor
-   `GET /admin/users/search` - Tìm kiếm người dùng
-   `PUT /admin/users/{userId}/enable` - Kích hoạt tài khoản
-   `PUT /admin/users/{userId}/disable` - Vô hiệu hóa tài khoản
-   `PUT /admin/users/{userId}/block` - Chặn tài khoản
-   `PUT /admin/users/{userId}/unblock` - Bỏ chặn tài khoản
-   `GET /admin/users/{userId}` - Lấy thông tin người dùng theo ID

**Chức năng chính:**

-   Quản lý tất cả người dùng trong hệ thống
-   Tìm kiếm và phân trang người dùng
-   Phê duyệt tutor và quản lý trạng thái tài khoản

### 6. DocumentService (`/src/services/document-service.ts`)

Tích hợp với `DocumentController` để truy cập tài liệu an toàn:

**API Endpoints:**

-   `GET /documents/{resourceId}` - Lấy tài liệu với signed URL

**Chức năng chính:**

-   Truy cập tài liệu với signed URL bảo mật
-   Download tài liệu trực tiếp
-   Mở tài liệu trong tab mới
-   Kiểm tra quyền truy cập tài liệu

### 7. LessonService (`/src/services/lesson-service.ts`)

Tích hợp với `LessonController` để quản lý bài học:

**API Endpoints:**

-   `GET /lessons/{lessonId}` - Lấy chi tiết bài học
-   `POST /lessons/{lessonId}/video` - Upload video cho bài học

**Chức năng chính:**

-   Lấy thông tin chi tiết bài học
-   Upload video cho bài học (dành cho tutor)
-   Quản lý tài nguyên và bài tập của bài học

### 8. Enhanced AuthService (`/src/lib/auth-service.ts`)

Bổ sung thêm các chức năng cho `AuthController`:

**API Endpoints mới:**

-   `POST /auth/reset-password` - Reset mật khẩu bằng token
-   `POST /auth/change-password` - Đổi mật khẩu cho user đã đăng nhập

**Chức năng mới:**

-   Reset mật khẩu qua email token
-   Đổi mật khẩu cho user đã đăng nhập

## Cách Sử Dụng

### Import Services

```typescript
import {
	StatisticsService,
	UserManagementService,
	LearningService,
	TutorService,
	AdminUserService,
	DocumentService,
	LessonService,
} from '@/services';
```

### Ví dụ sử dụng

```typescript
// Lấy thống kê dashboard
const dashboardStats = await StatisticsService.getDashboardStatistics();

// Phê duyệt tutor
await UserManagementService.approveTutor(tutorId);

// Lấy khóa học để học
const courseForLearning = await LearningService.getCourseForLearning(courseId);

// Upload chứng chỉ
await TutorService.uploadCertificate(file);

// Tìm kiếm người dùng
const users = await AdminUserService.searchUsers('john@example.com');

// Lấy tài liệu
const signedUrl = await DocumentService.getSignedUrl(resourceId);

// Lấy bài học
const lesson = await LessonService.getLessonById(lessonId);
```

## Lưu ý

1. **Authentication**: Tất cả các API đều yêu cầu authentication token trừ một số API public
2. **Authorization**: Các API có phân quyền rõ ràng (ADMIN, TUTOR, STUDENT)
3. **Error Handling**: Tất cả services đều có xử lý lỗi thống nhất
4. **TypeScript**: Tất cả đều có typing đầy đủ cho type safety
5. **Pagination**: Các API danh sách đều hỗ trợ pagination

## File Structure

```
src/
├── services/
│   ├── statistics-service.ts
│   ├── user-management-service.ts
│   ├── learning-service.ts
│   ├── tutor-service.ts
│   ├── admin-user-service.ts
│   ├── document-service.ts
│   ├── lesson-service.ts
│   └── index.ts (export tất cả services)
└── lib/
    └── auth-service.ts (enhanced)
```

Với việc thêm các service này, frontend đã có đầy đủ các chức năng để tương tác với tất cả API endpoints có sẵn trong backend (trừ các chức năng speech exercise như yêu cầu).
