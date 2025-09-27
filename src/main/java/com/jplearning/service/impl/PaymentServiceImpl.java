package com.jplearning.service.impl;

import com.jplearning.dto.request.QRTransferPaymentRequest;
import com.jplearning.dto.response.PaymentResponse;
import com.jplearning.dto.response.QRTransferResponse;
import com.jplearning.dto.response.StudentBriefResponse;
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
import com.jplearning.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

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

    @Override
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with transaction id: " + transactionId));

        return mapToResponse(payment);
    }

    @Override
    public Page<PaymentResponse> getStudentPayments(Long studentId, Pageable pageable) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Page<Payment> payments = paymentRepository.findByStudent(student, pageable);
        return payments.map(this::mapToResponse);
    }

    @Override
    public Page<PaymentResponse> getPendingPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findByStatus(Payment.PaymentStatus.PENDING, pageable);
        return payments.map(this::mapToResponse);
    }

    @Override
    public Page<PaymentResponse> getWaitingConfirmationPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findByStatus(Payment.PaymentStatus.WAITING_CONFIRMATION, pageable);
        return payments.map(this::mapToResponse);
    }

    @Override
    public QRTransferResponse createQRTransferPayment(Long studentId, QRTransferPaymentRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.valueOf(1000)) < 0) {
            throw new BadRequestException("Invalid amount");
        }

        // We will embed order context in orderInfo (course/combo title) similar to VNPay flow
        String orderInfo = request.getOrderInfo();
        if (orderInfo == null || orderInfo.isBlank()) {
            throw new BadRequestException("orderInfo is required");
        }

        Payment payment = Payment.builder()
                .transactionId(System.currentTimeMillis() + "-QR")
                .orderInfo(orderInfo)
                .amount(request.getAmount())
                .status(Payment.PaymentStatus.WAITING_CONFIRMATION)
                .method(Payment.PaymentMethod.QR_TRANSFER)
                .student(student)
                .successRedirectUrl(request.getSuccessRedirectUrl())
                .cancelRedirectUrl(request.getCancelRedirectUrl())
                .bankAccountInfo(request.getBankAccountInfo())
                .build();

        payment = paymentRepository.save(payment);

        // Fake QR url (frontend renders actual QR from bank info or amount+content); keep field for API completeness
        String qrUrl = "qr://bank-transfer?tx=" + payment.getTransactionId();

        return QRTransferResponse.builder()
                .paymentId(payment.getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .orderInfo(payment.getOrderInfo())
                .qrCodeUrl(qrUrl)
                .bankAccountInfo(payment.getBankAccountInfo())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .message("Created QR transfer payment. Please transfer and wait for admin confirmation.")
                .build();
    }

    @Override
    public QRTransferResponse getQRTransferPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        String qrUrl = "qr://bank-transfer?tx=" + payment.getTransactionId();
        return QRTransferResponse.builder()
                .paymentId(payment.getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .orderInfo(payment.getOrderInfo())
                .qrCodeUrl(qrUrl)
                .bankAccountInfo(payment.getBankAccountInfo())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .message("OK")
                .build();
    }

    @Override
    public PaymentResponse adminProcessPayment(Long paymentId, String action, String adminNotes) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getMethod() != Payment.PaymentMethod.QR_TRANSFER) {
            // For now, admin only processes QR/manual transfers
            throw new BadRequestException("Only QR transfer payments can be processed manually");
        }

        if (payment.getStatus() != Payment.PaymentStatus.WAITING_CONFIRMATION
                && payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new BadRequestException("Payment is not awaiting confirmation");
        }

        if ("approve".equalsIgnoreCase(action)) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
        } else if ("reject".equalsIgnoreCase(action)) {
            payment.setStatus(Payment.PaymentStatus.REJECTED);
        } else {
            throw new BadRequestException("Invalid action. Must be 'approve' or 'reject'");
        }

        payment.setAdminNotes(adminNotes);
        payment.setAdminProcessedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // If approved, enroll the student similar to VNPay flow
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            String orderInfo = payment.getOrderInfo();
            try {
                if (orderInfo != null && orderInfo.contains("Thanh toan khoa hoc #")) {
                    // Frontend sends orderInfo with courseId style: "Thanh toan khoa hoc #<id>"
                    String idStr = orderInfo.substring(orderInfo.indexOf('#') + 1).trim();
                    Long courseId = Long.parseLong(idStr);
                    enrollmentService.enrollStudentInCourse(payment.getStudent().getId(), courseId, payment);
                } else if (orderInfo != null && orderInfo.startsWith("Payment for course: ")) {
                    String courseTitle = orderInfo.replace("Payment for course: ", "").trim();
                    List<Course> courses = courseRepository.findByTitleContainingIgnoreCaseAndStatus(
                            courseTitle, Course.Status.APPROVED);
                    if (!courses.isEmpty()) {
                        enrollmentService.enrollStudentInCourse(payment.getStudent().getId(), courses.get(0).getId(), payment);
                    }
                } else if (orderInfo != null && orderInfo.startsWith("Payment for course combo: ")) {
                    String comboTitle = orderInfo.replace("Payment for course combo: ", "").trim();
                    List<CourseCombo> combos = comboRepository.findByTitleContainingIgnoreCaseAndIsActiveTrue(comboTitle);
                    if (!combos.isEmpty()) {
                        enrollmentService.enrollStudentInCombo(payment.getStudent().getId(), combos.get(0).getId(), payment);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        return mapToResponse(payment);
    }

    // Helper method to map Payment entity to PaymentResponse DTO
    private PaymentResponse mapToResponse(Payment payment) {
        StudentBriefResponse studentResponse = null;
        if (payment.getStudent() != null) {
            studentResponse = StudentBriefResponse.builder()
                    .id(payment.getStudent().getId())
                    .fullName(payment.getStudent().getFullName())
                    .email(payment.getStudent().getEmail())
                    .avatarUrl(payment.getStudent().getAvatarUrl())
                    .build();
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderInfo(payment.getOrderInfo())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .successRedirectUrl(payment.getSuccessRedirectUrl())
                .cancelRedirectUrl(payment.getCancelRedirectUrl())
                .student(studentResponse)
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .bankAccountInfo(payment.getBankAccountInfo())
                .adminNotes(payment.getAdminNotes())
                .adminProcessedAt(payment.getAdminProcessedAt())
                .build();
    }
}