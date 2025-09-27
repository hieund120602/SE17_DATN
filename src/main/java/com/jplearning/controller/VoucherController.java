package com.jplearning.controller;

import com.jplearning.dto.request.VoucherRequest;
import com.jplearning.dto.response.VoucherResponse;
import com.jplearning.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/vouchers")
@Tag(name = "Voucher", description = "Voucher management APIs")
@CrossOrigin(origins = "*")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @GetMapping
    @Operation(
            summary = "Get active vouchers",
            description = "Get all active vouchers that are currently valid",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Page<VoucherResponse>> getActiveVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "validUntil") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(voucherService.getActiveVouchers(pageable));
    }

    @GetMapping("/{voucherId}")
    @Operation(
            summary = "Get voucher by ID",
            description = "Get voucher details by ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherResponse> getVoucherById(@PathVariable Long voucherId) {
        return ResponseEntity.ok(voucherService.getVoucherById(voucherId));
    }

    @GetMapping("/validate")
    @Operation(
            summary = "Validate voucher code",
            description = "Validate voucher code and get voucher details"
    )
    public ResponseEntity<VoucherResponse> validateVoucher(@RequestParam String code) {
        return ResponseEntity.ok(voucherService.getVoucherByCode(code));
    }

    @GetMapping("/calculate-discount")
    @Operation(
            summary = "Calculate discount",
            description = "Calculate discount amount for a voucher code"
    )
    public ResponseEntity<BigDecimal> calculateDiscount(
            @RequestParam String code,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long comboId,
            @RequestParam Long studentId) {

        return ResponseEntity.ok(voucherService.calculateDiscount(
                code, amount, courseId, comboId, studentId));
    }

    @GetMapping("/course/{courseId}")
    @Operation(
            summary = "Get vouchers for course",
            description = "Get all valid vouchers applicable to a specific course"
    )
    public ResponseEntity<List<VoucherResponse>> getVouchersForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(voucherService.getValidVouchersForCourse(courseId));
    }

    @GetMapping("/combo/{comboId}")
    @Operation(
            summary = "Get vouchers for combo",
            description = "Get all valid vouchers applicable to a specific course combo"
    )
    public ResponseEntity<List<VoucherResponse>> getVouchersForCombo(@PathVariable Long comboId) {
        return ResponseEntity.ok(voucherService.getValidVouchersForCombo(comboId));
    }

    @PostMapping
    @Operation(
            summary = "Create voucher",
            description = "Create a new voucher (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.createVoucher(request));
    }

    @PutMapping("/{voucherId}")
    @Operation(
            summary = "Update voucher",
            description = "Update an existing voucher (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable Long voucherId,
            @Valid @RequestBody VoucherRequest request) {

        return ResponseEntity.ok(voucherService.updateVoucher(voucherId, request));
    }

    @DeleteMapping("/{voucherId}")
    @Operation(
            summary = "Delete voucher",
            description = "Delete (deactivate) an existing voucher (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long voucherId) {
        voucherService.deleteVoucher(voucherId);
        return ResponseEntity.noContent().build();
    }
}