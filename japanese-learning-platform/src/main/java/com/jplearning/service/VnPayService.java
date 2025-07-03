package com.jplearning.service;

import com.jplearning.dto.request.PaymentRequest;
import com.jplearning.dto.response.VnPayResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.Map;

public interface VnPayService {
    /**
     * Create payment URL for VNPay gateway
     *
     * @param request Payment information
     * @return URL and transaction ID
     */
    VnPayResponse createPaymentUrl(PaymentRequest request);

    /**
     * Process VNPay payment return
     *
     * @param vnpParams Parameters returned from VNPay
     * @return Result message
     */
    String processPaymentReturn(Map<String, String> vnpParams);

    /**
     * Query payment status from VNPay
     *
     * @param transactionId Transaction ID to query
     * @return Payment status
     * @throws IOException If an I/O error occurs
     */
    String queryPaymentStatus(String transactionId) throws IOException;
}