package com.jplearning.service.impl;

import com.jplearning.service.QRCodeService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class QRCodeServiceImpl implements QRCodeService {

    @Override
    public String generateQRCodeUrl(BigDecimal amount, String transactionId, String bankAccountInfo) {
        // Mặc định sử dụng VietQR
        return generateVietQRCode(amount, transactionId, "VCB", "1234567890", "CÔNG TY ABC");
    }

    @Override
    public String generateVietQRCode(BigDecimal amount, String transactionId, String bankCode, 
                                   String accountNumber, String accountName) {
        try {
            // Tạo VietQR URL theo chuẩn VietQR
            String vietQRData = String.format(
                "https://vietqr.io/transfer?bank=%s&account=%s&amount=%s&ref=%s&name=%s",
                bankCode,
                accountNumber,
                amount.toString(),
                transactionId,
                URLEncoder.encode(accountName, StandardCharsets.UTF_8.toString())
            );
            
            // Tạo QR code từ VietQR data
            return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                   URLEncoder.encode(vietQRData, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            // Fallback to simple QR code
            return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                   URLEncoder.encode("Thanh toan: " + amount + " VND - Ma GD: " + transactionId, StandardCharsets.UTF_8);
        }
    }

    @Override
    public String generateBankQRCode(BigDecimal amount, String transactionId, String bankInfo) {
        try {
            // Tạo QR code cho các ngân hàng khác
            String qrData = String.format(
                "Thanh toan: %s VND\nMa giao dich: %s\nThong tin: %s",
                amount.toString(),
                transactionId,
                bankInfo
            );
            
            return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                   URLEncoder.encode(qrData, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            // Fallback to simple QR code
            return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
                   URLEncoder.encode("Thanh toan: " + amount + " VND - Ma GD: " + transactionId, StandardCharsets.UTF_8);
        }
    }
} 