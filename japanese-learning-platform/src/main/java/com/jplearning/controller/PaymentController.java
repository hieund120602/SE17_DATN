package com.jplearning.controller;

import com.jplearning.dto.request.PaymentRequest;
import com.jplearning.dto.response.PaymentResponse;
import com.jplearning.dto.response.VnPayResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.PaymentService;
import com.jplearning.service.VnPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@Tag(name = "Payment", description = "Payment APIs")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private VnPayService vnPayService;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    @Operation(
            summary = "Create payment",
            description = "Create a payment and get VNPay URL",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<VnPayResponse> createPayment(@RequestBody PaymentRequest request) {
        // Validate manually những field bắt buộc
        if (request.getAmount() == null) {
            throw new IllegalArgumentException("Amount is required");
        }
        
        // Set studentId từ authenticated user
        Long studentId = getCurrentUserId();
        request.setStudentId(studentId);
        
        return ResponseEntity.ok(vnPayService.createPaymentUrl(request));
    }

    @GetMapping("/vnpay-return")
    @Operation(
            summary = "VNPay return",
            description = "Process VNPay payment return - This endpoint receives query parameters from VNPAY"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment processed successfully")
    })
    @Parameters({
            @Parameter(name = "vnp_ResponseCode", description = "Response code from VNPAY", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_TxnRef", description = "Transaction reference", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_Amount", description = "Payment amount", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_OrderInfo", description = "Order information", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_BankCode", description = "Bank code", required = false, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_BankTranNo", description = "Bank transaction number", required = false, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_CardType", description = "Card type", required = false, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_PayDate", description = "Payment date", required = false, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_TransactionNo", description = "Transaction number", required = false, in = ParameterIn.QUERY),
            @Parameter(name = "vnp_SecureHash", description = "Security hash for verification", required = true, in = ParameterIn.QUERY)
    })
    public ResponseEntity<String> processVnPayReturn(
            HttpServletRequest request,
            @RequestParam(required = false) String vnp_ResponseCode,
            @RequestParam(required = false) String vnp_TxnRef,
            @RequestParam(required = false) String vnp_Amount,
            @RequestParam(required = false) String vnp_OrderInfo,
            @RequestParam(required = false) String vnp_SecureHash
    ) {
        // Get all parameters from the request
        Map<String, String> vnpParams = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();

        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            vnpParams.put(paramName, paramValue);
        }

        // Process payment return
        String result = vnPayService.processPaymentReturn(vnpParams);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{paymentId}")
    @Operation(
            summary = "Get payment",
            description = "Get payment details by ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    @GetMapping("/my-history")
    @Operation(
            summary = "Get my payment history",
            description = "Get payment history for the current student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<PaymentResponse>> getMyPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Long studentId = getCurrentUserId();
        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(paymentService.getStudentPayments(studentId, pageable));
    }

    @GetMapping("/admin/pending")
    @Operation(
            summary = "Get pending payments",
            description = "Get all pending payments (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentResponse>> getPendingPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(paymentService.getPendingPayments(pageable));
    }

    @GetMapping("/status/{transactionId}")
    @Operation(
            summary = "Check payment status",
            description = "Check payment status by transaction ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<String> checkPaymentStatus(@PathVariable String transactionId) {
        try {
            return ResponseEntity.ok(vnPayService.queryPaymentStatus(transactionId));
        } catch (Exception e) {
            return ResponseEntity.ok("Error checking payment status: " + e.getMessage());
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}