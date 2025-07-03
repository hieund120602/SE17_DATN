package com.jplearning.service;

import com.jplearning.dto.response.PaymentResponse;
import com.jplearning.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    /**
     * Create a new payment record
     *
     * @param payment Payment entity
     * @return Saved payment
     */
    Payment savePayment(Payment payment);

    /**
     * Get payment by ID
     *
     * @param paymentId ID of the payment
     * @return Payment response
     */
    PaymentResponse getPaymentById(Long paymentId);

    /**
     * Get payment by transaction ID
     *
     * @param transactionId Transaction ID
     * @return Payment response
     */
    PaymentResponse getPaymentByTransactionId(String transactionId);

    /**
     * Get all payments for a student
     *
     * @param studentId ID of the student
     * @param pageable Pagination information
     * @return Page of payment responses
     */
    Page<PaymentResponse> getStudentPayments(Long studentId, Pageable pageable);

    /**
     * Get all pending payments
     *
     * @param pageable Pagination information
     * @return Page of payment responses
     */
    Page<PaymentResponse> getPendingPayments(Pageable pageable);
}