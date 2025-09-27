package com.jplearning.service;

import java.math.BigDecimal;

public interface QRCodeService {
    
    /**
     * Tạo QR code URL cho thanh toán chuyển khoản
     * 
     * @param amount Số tiền thanh toán
     * @param transactionId ID giao dịch
     * @param bankAccountInfo Thông tin tài khoản ngân hàng
     * @return URL của QR code
     */
    String generateQRCodeUrl(BigDecimal amount, String transactionId, String bankAccountInfo);
    
    /**
     * Tạo QR code cho VietQR
     * 
     * @param amount Số tiền thanh toán
     * @param transactionId ID giao dịch
     * @param bankCode Mã ngân hàng (VCB, TCB, etc.)
     * @param accountNumber Số tài khoản
     * @param accountName Tên chủ tài khoản
     * @return URL của QR code VietQR
     */
    String generateVietQRCode(BigDecimal amount, String transactionId, String bankCode, 
                            String accountNumber, String accountName);
    
    /**
     * Tạo QR code cho các ngân hàng khác
     * 
     * @param amount Số tiền thanh toán
     * @param transactionId ID giao dịch
     * @param bankInfo Thông tin ngân hàng
     * @return URL của QR code
     */
    String generateBankQRCode(BigDecimal amount, String transactionId, String bankInfo);
} 