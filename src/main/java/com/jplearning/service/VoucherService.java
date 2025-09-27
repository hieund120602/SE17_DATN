package com.jplearning.service;

import com.jplearning.dto.request.VoucherRequest;
import com.jplearning.dto.response.VoucherResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {
    /**
     * Create a new voucher
     *
     * @param request Voucher creation request
     * @return Created voucher response
     */
    VoucherResponse createVoucher(VoucherRequest request);

    /**
     * Update an existing voucher
     *
     * @param voucherId ID of the voucher to update
     * @param request Updated voucher details
     * @return Updated voucher response
     */
    VoucherResponse updateVoucher(Long voucherId, VoucherRequest request);

    /**
     * Delete a voucher
     *
     * @param voucherId ID of the voucher to delete
     */
    void deleteVoucher(Long voucherId);

    /**
     * Get a voucher by ID
     *
     * @param voucherId ID of the voucher
     * @return Voucher response
     */
    VoucherResponse getVoucherById(Long voucherId);

    /**
     * Get a voucher by code
     *
     * @param code Code of the voucher
     * @return Voucher response
     */
    VoucherResponse getVoucherByCode(String code);

    /**
     * Get all active vouchers
     *
     * @param pageable Pagination information
     * @return Page of active vouchers
     */
    Page<VoucherResponse> getActiveVouchers(Pageable pageable);

    /**
     * Get all valid vouchers for a course
     *
     * @param courseId ID of the course
     * @return List of valid vouchers
     */
    List<VoucherResponse> getValidVouchersForCourse(Long courseId);

    /**
     * Get all valid vouchers for a combo
     *
     * @param comboId ID of the combo
     * @return List of valid vouchers
     */
    List<VoucherResponse> getValidVouchersForCombo(Long comboId);

    /**
     * Apply a voucher and calculate discount
     *
     * @param code Voucher code
     * @param amount Original amount
     * @param courseId ID of the course (optional)
     * @param comboId ID of the combo (optional)
     * @param studentId ID of the student
     * @return Discount amount
     */
    BigDecimal calculateDiscount(String code, BigDecimal amount, Long courseId, Long comboId, Long studentId);
}