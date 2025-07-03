package com.jplearning.service.impl;

import com.jplearning.dto.response.PaymentResponse;
import com.jplearning.dto.response.StudentBriefResponse;
import com.jplearning.entity.Payment;
import com.jplearning.entity.Student;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.PaymentRepository;
import com.jplearning.repository.StudentRepository;
import com.jplearning.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

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
                .build();
    }
}