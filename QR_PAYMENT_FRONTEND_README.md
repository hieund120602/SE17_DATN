# Tính năng Thanh toán QR - Frontend

## Tổng quan

Tính năng thanh toán chuyển khoản QR đã được tích hợp vào frontend, cho phép người dùng thanh toán khóa học thông qua quét mã QR và admin quản lý các thanh toán này.

## Components đã tạo

### 1. QRPaymentModal

**File:** `src/components/qr-payment-modal.tsx`

Component hiển thị QR code và thông tin thanh toán chuyển khoản.

**Tính năng:**

-   Hiển thị QR code để người dùng quét
-   Hiển thị thông tin tài khoản ngân hàng
-   Cho phép sao chép thông tin ngân hàng
-   Tải xuống QR code
-   Cập nhật trạng thái thanh toán
-   Hiển thị trạng thái thanh toán với màu sắc khác nhau

**Props:**

```tsx
interface QRPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	paymentData: QRTransferResponse | null;
	onRefresh?: () => void;
}
```

### 2. PaymentOptionsModal

**File:** `src/components/payment-options-modal.tsx`

Component cho phép người dùng chọn phương thức thanh toán (VNPay hoặc QR).

**Tính năng:**

-   Chọn phương thức thanh toán
-   Tạo thanh toán VNPay
-   Tạo thanh toán QR và hiển thị QR code
-   Xử lý lỗi và thông báo

**Props:**

```tsx
interface PaymentOptionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	courseId: number;
	price: number;
	dictionary: any;
}
```

### 3. AdminPaymentManagement

**File:** `src/components/admin-payment-management.tsx`

Component quản lý thanh toán cho admin.

**Tính năng:**

-   Xem danh sách thanh toán chờ xác nhận
-   Xem danh sách thanh toán đang xử lý
-   Chấp nhận/từ chối thanh toán
-   Thêm ghi chú cho thanh toán
-   Hiển thị thông tin chi tiết thanh toán
-   Làm mới danh sách

### 4. PaymentHistory

**File:** `src/components/payment-history.tsx`

Component hiển thị lịch sử thanh toán cho người dùng.

**Tính năng:**

-   Xem lịch sử thanh toán cá nhân
-   Xem chi tiết từng thanh toán
-   Xem QR code cho thanh toán chờ xác nhận
-   Cập nhật trạng thái thanh toán

## Services đã cập nhật

### PaymentService

**File:** `src/services/payment-service.ts`

Đã thêm các method mới:

```typescript
// QR Transfer Payment
createQRTransferPayment(paymentData: QRTransferPaymentRequest): Promise<QRTransferResponse>
getQRTransferPayment(paymentId: number): Promise<QRTransferResponse>

// Payment Management
getPayment(paymentId: number): Promise<PaymentResponse>
getMyPaymentHistory(page?: number, size?: number): Promise<PageResponse>
getPaymentsWaitingConfirmation(page?: number, size?: number): Promise<PageResponse>
getPendingPayments(page?: number, size?: number): Promise<PageResponse>
processPayment(request: AdminProcessPaymentRequest): Promise<PaymentResponse>
```

## Interfaces mới

### QRTransferPaymentRequest

```typescript
interface QRTransferPaymentRequest {
	amount: number;
	orderInfo: string;
	successRedirectUrl?: string;
	cancelRedirectUrl?: string;
	bankAccountInfo?: string;
}
```

### QRTransferResponse

```typescript
interface QRTransferResponse {
	paymentId: number;
	transactionId: string;
	amount: number;
	orderInfo: string;
	qrCodeUrl: string;
	bankAccountInfo: string;
	status: string;
	createdAt: string;
	message: string;
}
```

### PaymentResponse

```typescript
interface PaymentResponse {
	id: number;
	transactionId: string;
	orderInfo: string;
	amount: number;
	status: string;
	method: string;
	successRedirectUrl?: string;
	cancelRedirectUrl?: string;
	student?: {
		id: number;
		fullName: string;
		email: string;
		avatarUrl?: string;
	};
	createdAt: string;
	paidAt?: string;
	qrCodeUrl?: string;
	bankAccountInfo?: string;
	adminNotes?: string;
	adminProcessedAt?: string;
}
```

## Pages đã tạo

### Admin Payment Management

**File:** `src/app/(admin)/admin/payments/page.tsx`

Trang quản lý thanh toán cho admin với các tính năng:

-   Xem danh sách thanh toán chờ xác nhận
-   Xem danh sách thanh toán đang xử lý
-   Chấp nhận/từ chối thanh toán
-   Thêm ghi chú

## Cách sử dụng

### 1. Cho người dùng

#### Tạo thanh toán QR

```tsx
import PaymentOptionsModal from '@/components/payment-options-modal';

// Trong component
<PaymentOptionsModal
	isOpen={showPaymentModal}
	onClose={() => setShowPaymentModal(false)}
	courseId={courseId}
	price={price}
	dictionary={dictionary}
/>;
```

#### Xem lịch sử thanh toán

```tsx
import PaymentHistory from '@/components/payment-history';

// Trong component
<PaymentHistory />;
```

### 2. Cho admin

#### Quản lý thanh toán

```tsx
import AdminPaymentManagement from '@/components/admin-payment-management';

// Trong component
<AdminPaymentManagement />;
```

## Luồng hoạt động

### 1. Người dùng thanh toán

1. Click "Đăng ký khóa học"
2. Chọn phương thức thanh toán (VNPay hoặc QR)
3. Nếu chọn QR:
    - Hiển thị QR code
    - Quét QR và chuyển khoản
    - Chờ admin xác nhận
4. Nếu chọn VNPay:
    - Chuyển đến trang VNPay
    - Thanh toán trực tuyến

### 2. Admin quản lý

1. Vào trang "Thanh toán" trong admin panel
2. Xem danh sách thanh toán chờ xác nhận
3. Kiểm tra thông tin chuyển khoản
4. Chấp nhận hoặc từ chối thanh toán
5. Thêm ghi chú nếu cần

## Styling

### Trạng thái thanh toán

-   `WAITING_CONFIRMATION`: Màu vàng
-   `COMPLETED`: Màu xanh lá
-   `REJECTED`: Màu đỏ
-   `PENDING`: Màu xanh dương
-   `FAILED`: Màu đỏ
-   `CANCELED`: Màu xám

### Phương thức thanh toán

-   `QR_TRANSFER`: "Chuyển khoản QR"
-   `VNPAY`: "VNPay"

## Lưu ý

1. **QR Code Generation**: Hiện tại sử dụng API công cộng để tạo QR code. Trong production, nên sử dụng service chuyên dụng.

2. **Bank Information**: Thông tin tài khoản ngân hàng có thể được cấu hình từ backend.

3. **Error Handling**: Tất cả các API call đều có error handling và hiển thị toast notification.

4. **Responsive Design**: Các component đều responsive và hoạt động tốt trên mobile.

5. **Accessibility**: Sử dụng semantic HTML và ARIA labels cho accessibility.

## Testing

### Test QR Payment Flow

1. Tạo thanh toán QR
2. Kiểm tra QR code hiển thị
3. Test sao chép thông tin ngân hàng
4. Test tải xuống QR code
5. Test cập nhật trạng thái

### Test Admin Management

1. Xem danh sách thanh toán
2. Test chấp nhận thanh toán
3. Test từ chối thanh toán
4. Test thêm ghi chú

### Test Payment History

1. Xem lịch sử thanh toán
2. Test xem chi tiết thanh toán
3. Test xem QR code cho thanh toán chờ xác nhận

## Dependencies

Các dependencies cần thiết:

-   `lucide-react`: Icons
-   `@/components/ui/*`: UI components
-   `@/hooks/use-toast`: Toast notifications
-   `@/context/AuthContext`: Authentication context
-   `@/services/payment-service`: Payment API service
