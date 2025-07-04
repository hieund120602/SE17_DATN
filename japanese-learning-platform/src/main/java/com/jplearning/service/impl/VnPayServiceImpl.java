package com.jplearning.service.impl;

import com.jplearning.config.VnPayConfig;
import com.jplearning.dto.request.PaymentRequest;
import com.jplearning.dto.response.VnPayResponse;
import com.jplearning.entity.Course;
import com.jplearning.entity.CourseCombo;
import com.jplearning.entity.Payment;
import com.jplearning.entity.Student;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.CourseComboRepository;
import com.jplearning.repository.CourseRepository;
import com.jplearning.repository.PaymentRepository;
import com.jplearning.repository.StudentRepository;
import com.jplearning.service.EnrollmentService;
import com.jplearning.service.VnPayService;
import com.jplearning.service.VoucherService;
import com.nimbusds.jose.shaded.gson.Gson;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VnPayServiceImpl implements VnPayService {
    private static final Logger logger = LoggerFactory.getLogger(VnPayServiceImpl.class);

    @Autowired
    private VnPayConfig vnPayConfig;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseComboRepository comboRepository;

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private VoucherService voucherService;

    @Override
    public VnPayResponse createPaymentUrl(PaymentRequest request) {
        // Validate student
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        // Validate request parameters
        if (request.getCourseId() == null && request.getComboId() == null) {
            throw new BadRequestException("Either courseId or comboId must be provided");
        }

        if (request.getCourseId() != null && request.getComboId() != null) {
            throw new BadRequestException("Only one of courseId or comboId can be provided");
        }

        // Prepare order info
        String orderInfo;
        BigDecimal amount = request.getAmount();

        // Check and prepare order info
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

            // Ensure course is approved
            if (course.getStatus() != Course.Status.APPROVED) {
                throw new BadRequestException("Course is not available for purchase");
            }

            orderInfo = "Payment for course: " + course.getTitle();
        } else {
            CourseCombo combo = comboRepository.findById(request.getComboId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course combo not found with id: " + request.getComboId()));

            // Ensure combo is active
            if (!combo.isActive() || (combo.getValidUntil() != null && combo.getValidUntil().isBefore(LocalDateTime.now()))) {
                throw new BadRequestException("Course combo is not available for purchase");
            }

            orderInfo = "Payment for course combo: " + combo.getTitle();
        }

        // Apply voucher if provided
        if (request.getVoucherCode() != null && !request.getVoucherCode().isEmpty()) {
            BigDecimal discountAmount = voucherService.calculateDiscount(
                    request.getVoucherCode(),
                    amount,
                    request.getCourseId(),
                    request.getComboId(),
                    student.getId()
            );

            if (discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                amount = amount.subtract(discountAmount);
                // Ensure minimum amount
                if (amount.compareTo(BigDecimal.valueOf(1000)) < 0) {
                    amount = BigDecimal.valueOf(1000); // Minimum 1000 VND
                }
            }
        }

        // Create payment record
        Payment payment = Payment.builder()
                .transactionId(generateTransactionId())
                .orderInfo(orderInfo)
                .amount(amount)
                .status(Payment.PaymentStatus.PENDING)
                .method(Payment.PaymentMethod.VNPAY)
                .student(student)
                .successRedirectUrl(request.getSuccessRedirectUrl())
                .cancelRedirectUrl(request.getCancelRedirectUrl())
                .build();

        paymentRepository.save(payment);

        // Create VNPay payment URL
        String paymentUrl = createVnPayUrl(payment);

        return VnPayResponse.builder()
                .paymentUrl(paymentUrl)
                .transactionId(payment.getTransactionId())
                .orderInfo(payment.getOrderInfo())
                .build();
    }

    @Override
    @Transactional
    public String processPaymentReturn(Map<String, String> vnpParams) {
        String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
        String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
        String vnp_Amount = vnpParams.get("vnp_Amount");
        String vnp_OrderInfo = vnpParams.get("vnp_OrderInfo");
        String vnp_SecureHash = vnpParams.get("vnp_SecureHash");

        // Validate hash
        if (!validateHash(vnpParams)) {
            logger.error("Invalid VNPay hash in payment return");
            return "Invalid payment data";
        }

        // Find payment by transaction ID
        Optional<Payment> optionalPayment = paymentRepository.findByTransactionId(vnp_TxnRef);
        if (optionalPayment.isEmpty()) {
            logger.error("Payment not found with transaction ID: {}", vnp_TxnRef);
            return "Payment not found";
        }

        Payment payment = optionalPayment.get();

        String paymentResponseStr = limitMapToString(vnpParams);
        payment.setPaymentResponse(paymentResponseStr);

        // Store response data
        payment.setPaymentResponse(vnpParams.toString());

        // Check response code
        if ("00".equals(vnp_ResponseCode)) {
            // Payment successful
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Process enrollment if course or combo ID exists
            processEnrollment(payment);

            return "Payment successful";
        } else {
            // Payment failed
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return "Payment failed with code: " + vnp_ResponseCode;
        }
    }

    private String limitMapToString(Map<String, String> map) {
        // Option 1: Convert to JSON with a maximum length
        String json = new Gson().toJson(map);
        if (json.length() > 1000) {  // Set a reasonable limit
            return json.substring(0, 1000) + "..."; // Truncate
        }
        return json;

        // Option 2: Store only essential fields
    /*
    Map<String, String> essentialParams = new HashMap<>();
    String[] keysToKeep = {"vnp_ResponseCode", "vnp_TxnRef", "vnp_Amount", "vnp_OrderInfo"};
    for (String key : keysToKeep) {
        if (map.containsKey(key)) {
            essentialParams.put(key, map.get(key));
        }
    }
    return new Gson().toJson(essentialParams);
    */
    }

    @Override
    public String queryPaymentStatus(String transactionId) throws IOException {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(vnPayConfig.getApiUrl());
            httpPost.setHeader("Content-Type", "application/json");

            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_RequestId", generateRequestId());
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", "querydr");
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_TxnRef", transactionId);
            vnpParams.put("vnp_OrderInfo", "Query payment status");
            vnpParams.put("vnp_TransactionNo", ""); // For query, this can be empty
            vnpParams.put("vnp_CreateDate", generateVnPayDate());

            // Generate secure hash
            String secureHash = generateHash(vnpParams);
            vnpParams.put("vnp_SecureHash", secureHash);

            // Convert params to JSON
            String jsonBody = mapToJson(vnpParams);
            StringEntity entity = new StringEntity(jsonBody);
            httpPost.setEntity(entity);

            // Execute request
            CloseableHttpResponse response = client.execute(httpPost);
            String responseString = EntityUtils.toString(response.getEntity(), "UTF-8");

            // Process response
            // In a real implementation, parse the JSON response and update payment status
            return responseString;
        }
    }

    // Helper methods

    private String createVnPayUrl(Payment payment) {
        try {
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue())); // Convert to cents
            vnpParams.put("vnp_CurrCode", vnPayConfig.getCurrCode());
            vnpParams.put("vnp_TxnRef", payment.getTransactionId());
            vnpParams.put("vnp_OrderInfo", payment.getOrderInfo());
            vnpParams.put("vnp_OrderType", "other"); // OrderType
            vnpParams.put("vnp_Locale", vnPayConfig.getLocale());
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1"); // In real app, get from request
            vnpParams.put("vnp_CreateDate", generateVnPayDate());

            // Build URL
            StringBuilder query = new StringBuilder();
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                if (!entry.getValue().isEmpty()) {
                    query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()));
                    query.append("=");
                    query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
                    query.append("&");
                }
            }

            // Remove last '&'
            String queryUrl = query.substring(0, query.length() - 1);

            // Generate secure hash
            String secureHash = generateHash(vnpParams);

            // Append secure hash
            queryUrl += "&vnp_SecureHash=" + secureHash;

            // Return full URL
            return vnPayConfig.getPaymentUrl() + "?" + queryUrl;

        } catch (Exception e) {
            logger.error("Error creating VNPay URL", e);
            throw new RuntimeException("Error creating payment URL", e);
        }
    }

    private boolean validateHash(Map<String, String> vnpParams) {
        try {
            // Lấy chữ ký từ tham số
            String vnp_SecureHash = vnpParams.getOrDefault("vnp_SecureHash", "");

            // Tạo map mới loại bỏ các tham số không cần thiết cho tính hash
            Map<String, String> validParams = new HashMap<>(vnpParams);
            validParams.remove("vnp_SecureHash");
            validParams.remove("vnp_SecureHashType");

            // Tạo lại chữ ký từ tham số hợp lệ
            String generatedHash = generateHash(validParams);

            // So sánh chữ ký
            return generatedHash.equalsIgnoreCase(vnp_SecureHash);
        } catch (Exception e) {
            logger.error("Error validating VNPay hash", e);
            return false;
        }
    }

    private String generateHash(Map<String, String> params) {
        try {
            // Sắp xếp param theo key
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            // Xây dựng chuỗi hash data đúng định dạng VNPAY
            StringBuilder hashData = new StringBuilder();
            for (String fieldName : fieldNames) {
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    // Đảm bảo không có kí tự & ở cuối
                    hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString())).append("&");
                }
            }

            // Cắt bỏ kí tự & cuối cùng
            if (hashData.length() > 0) {
                hashData.setLength(hashData.length() - 1);
            }

            // Sử dụng đúng thuật toán HMAC_SHA512
            Mac hmacSha512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(vnPayConfig.getHashSecret().getBytes(), "HmacSHA512");
            hmacSha512.init(secretKey);
            byte[] hashBytes = hmacSha512.doFinal(hashData.toString().getBytes(StandardCharsets.UTF_8));

            // Chuyển về hex string
            return bytesToHex(hashBytes);
        } catch (Exception e) {
            logger.error("Error generating VNPay hash", e);
            throw new RuntimeException("Error generating hash", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private String generateTransactionId() {
        return System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String generateRequestId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String generateVnPayDate() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("GMT+7")); // Múi giờ Việt Nam
        return formatter.format(new Date());
    }

    private String mapToJson(Map<String, String> map) {
        StringBuilder json = new StringBuilder("{");
        for (Map.Entry<String, String> entry : map.entrySet()) {
            json.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\",");
        }
        if (json.charAt(json.length() - 1) == ',') {
            json.setLength(json.length() - 1);
        }
        json.append("}");
        return json.toString();
    }

    private void processEnrollment(Payment payment) {
        try {
            // Find student
            Student student = payment.getStudent();

            // Extract courseId or comboId from orderInfo
            String orderInfo = payment.getOrderInfo();

            if (orderInfo.contains("Payment for course:")) {
                // Process single course enrollment
                String courseTitle = orderInfo.replace("Payment for course: ", "").trim();
                List<Course> courses = courseRepository.findByTitleContainingIgnoreCaseAndStatus(
                        courseTitle, Course.Status.APPROVED);

                if (!courses.isEmpty()) {
                    Course course = courses.get(0);
                    // Enroll student and increment countBuy via the enrollment service
                    enrollmentService.enrollStudentInCourse(student.getId(), course.getId(), payment);
                }
            } else if (orderInfo.contains("Payment for course combo:")) {
                // Process combo enrollment
                String comboTitle = orderInfo.replace("Payment for course combo: ", "").trim();
                List<CourseCombo> combos = comboRepository.findByTitleContainingIgnoreCaseAndIsActiveTrue(comboTitle);

                if (!combos.isEmpty()) {
                    CourseCombo combo = combos.get(0);
                    // Enroll student in combo - this will increment countBuy for each course
                    enrollmentService.enrollStudentInCombo(student.getId(), combo.getId(), payment);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing enrollment after payment", e);
            // Continue anyway to avoid rollback of payment status
        }
    }
}