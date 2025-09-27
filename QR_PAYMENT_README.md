# Tính năng Thanh toán Chuyển khoản QR

## Tổng quan

Tính năng này cho phép người dùng thanh toán khóa học thông qua chuyển khoản ngân hàng với mã QR. Admin sẽ xác nhận thanh toán sau khi người dùng hoàn tất chuyển khoản.

## Luồng hoạt động

### 1. Người dùng tạo thanh toán QR

-   Gọi API: `POST /payments/qr-transfer`
-   Nhận về QR code và thông tin tài khoản ngân hàng
-   Hiển thị QR code cho người dùng quét

### 2. Người dùng quét QR và chuyển khoản

-   Quét QR code bằng app ngân hàng
-   Thực hiện chuyển khoản theo thông tin hiển thị
-   Lưu mã giao dịch để đối soát

### 3. Admin xác nhận thanh toán

-   Admin vào trang quản lý thanh toán
-   Xem danh sách thanh toán chờ xác nhận
-   Kiểm tra thông tin chuyển khoản
-   Chấp nhận hoặc từ chối thanh toán

## API Endpoints

### Tạo thanh toán QR

```http
POST /payments/qr-transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500000,
  "orderInfo": "Thanh toan khoa hoc N5",
  "successRedirectUrl": "https://example.com/success",
  "cancelRedirectUrl": "https://example.com/cancel",
  "bankAccountInfo": "Ngân hàng: Vietcombank\nSố tài khoản: 1234567890\nChủ tài khoản: CÔNG TY ABC"
}
```

### Lấy thông tin thanh toán QR

```http
GET /payments/qr-transfer/{paymentId}
Authorization: Bearer {token}
```

### Admin: Lấy danh sách thanh toán chờ xác nhận

```http
GET /admin/payments/waiting-confirmation?page=0&size=10
Authorization: Bearer {admin_token}
```

### Admin: Xử lý thanh toán

```http
POST /admin/payments/process
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "paymentId": 123,
  "action": "approve", // hoặc "reject"
  "adminNotes": "Đã xác nhận chuyển khoản"
}
```

## Cấu trúc Database

### Bảng payments - Các trường mới

```sql
ALTER TABLE payments
ADD COLUMN qr_code_url VARCHAR(500),
ADD COLUMN bank_account_info TEXT,
ADD COLUMN admin_notes TEXT,
ADD COLUMN admin_processed_at TIMESTAMP,
ADD COLUMN processed_by_admin_id BIGINT;
```

### Trạng thái thanh toán mới

-   `WAITING_CONFIRMATION`: Chờ admin xác nhận
-   `REJECTED`: Bị từ chối bởi admin

### Phương thức thanh toán mới

-   `QR_TRANSFER`: Thanh toán chuyển khoản QR

## Frontend Integration

### 1. Component hiển thị QR code

```tsx
const QRPaymentComponent = ({ paymentData }) => {
	return (
		<div className='qr-payment-container'>
			<h3>Thanh toán chuyển khoản</h3>
			<div className='qr-code'>
				<img src={paymentData.qrCodeUrl} alt='QR Code' />
			</div>
			<div className='bank-info'>
				<pre>{paymentData.bankAccountInfo}</pre>
			</div>
			<div className='payment-status'>Trạng thái: {paymentData.status}</div>
		</div>
	);
};
```

### 2. Admin component quản lý thanh toán

```tsx
const AdminPaymentManagement = () => {
	const [payments, setPayments] = useState([]);

	const handleApprove = async (paymentId) => {
		await fetch('/admin/payments/process', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				paymentId,
				action: 'approve',
				adminNotes: 'Đã xác nhận',
			}),
		});
	};

	const handleReject = async (paymentId) => {
		await fetch('/admin/payments/process', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				paymentId,
				action: 'reject',
				adminNotes: 'Không tìm thấy giao dịch',
			}),
		});
	};

	return (
		<div className='admin-payment-management'>
			<h2>Quản lý thanh toán chuyển khoản</h2>
			{payments.map((payment) => (
				<div key={payment.id} className='payment-item'>
					<div>ID: {payment.id}</div>
					<div>Số tiền: {payment.amount}</div>
					<div>Người dùng: {payment.student.fullName}</div>
					<div>Thời gian: {payment.createdAt}</div>
					<div className='actions'>
						<button onClick={() => handleApprove(payment.id)}>Chấp nhận</button>
						<button onClick={() => handleReject(payment.id)}>Từ chối</button>
					</div>
				</div>
			))}
		</div>
	);
};
```

## Cấu hình

### 1. Thông tin tài khoản ngân hàng

Có thể cấu hình trong `application.properties`:

```properties
# Thông tin tài khoản ngân hàng
payment.bank.code=VCB
payment.bank.account=1234567890
payment.bank.name=CÔNG TY ABC
payment.bank.info=Ngân hàng: Vietcombank\nSố tài khoản: 1234567890\nChủ tài khoản: CÔNG TY ABC
```

### 2. QR Code Service

Có thể tích hợp với các service tạo QR code thực tế:

-   VietQR API
-   QR Server API
-   Custom QR generation

## Bảo mật

### 1. Xác thực

-   Tất cả API đều yêu cầu JWT token
-   Admin endpoints yêu cầu role ADMIN
-   Student endpoints yêu cầu role STUDENT

### 2. Validation

-   Validate số tiền thanh toán
-   Validate thông tin giao dịch
-   Kiểm tra quyền truy cập

### 3. Audit trail

-   Lưu log admin xử lý thanh toán
-   Lưu thời gian xử lý
-   Lưu ghi chú admin

## Testing

### 1. Test tạo thanh toán QR

```bash
curl -X POST http://localhost:8080/payments/qr-transfer \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500000,
    "orderInfo": "Test payment"
  }'
```

### 2. Test admin xử lý thanh toán

```bash
curl -X POST http://localhost:8080/admin/payments/process \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": 1,
    "action": "approve",
    "adminNotes": "Test approval"
  }'
```

## Lưu ý

1. **QR Code Generation**: Hiện tại sử dụng API công cộng để tạo QR code. Trong production, nên sử dụng service chuyên dụng.

2. **Bank Integration**: Có thể tích hợp với API ngân hàng để tự động xác nhận giao dịch.

3. **Notification**: Có thể thêm thông báo cho người dùng khi admin xử lý thanh toán.

4. **Timeout**: Nên có cơ chế timeout cho thanh toán chờ xác nhận.

5. **Backup**: Lưu trữ thông tin thanh toán để đối soát.
