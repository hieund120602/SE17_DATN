package com.jplearning.service.impl;

import com.jplearning.dto.request.VoucherRequest;
import com.jplearning.dto.response.ComboBriefResponse;
import com.jplearning.dto.response.CourseBriefResponse;
import com.jplearning.dto.response.VoucherResponse;
import com.jplearning.entity.Course;
import com.jplearning.entity.CourseCombo;
import com.jplearning.entity.Voucher;
import com.jplearning.entity.VoucherUsage;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.CourseMapper;
import com.jplearning.repository.*;
import com.jplearning.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VoucherServiceImpl implements VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private VoucherUsageRepository voucherUsageRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseComboRepository comboRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private LevelRepository levelRepository;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        // Validate code uniqueness
        if (voucherRepository.findByCodeAndIsActiveTrue(request.getCode()).isPresent()) {
            throw new BadRequestException("Voucher code already exists");
        }

        // Create voucher entity
        Voucher voucher = Voucher.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minimumPurchaseAmount(request.getMinimumPurchaseAmount())
                .maximumDiscountAmount(request.getMaximumDiscountAmount())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .totalUsageLimit(request.getTotalUsageLimit())
                .perUserLimit(request.getPerUserLimit())
                .usageCount(0)
                .isActive(true)
                .applicableCourses(new HashSet<>())
                .applicableCombos(new HashSet<>())
                .build();

        // Add applicable courses if provided
        if (request.getApplicableCourseIds() != null && !request.getApplicableCourseIds().isEmpty()) {
            Set<Course> applicableCourses = new HashSet<>();
            for (Long courseId : request.getApplicableCourseIds()) {
                Course course = courseRepository.findById(courseId)
                        .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
                applicableCourses.add(course);
            }
            voucher.setApplicableCourses(applicableCourses);
        }

        // Add applicable combos if provided
        if (request.getApplicableComboIds() != null && !request.getApplicableComboIds().isEmpty()) {
            Set<CourseCombo> applicableCombos = new HashSet<>();
            for (Long comboId : request.getApplicableComboIds()) {
                CourseCombo combo = comboRepository.findById(comboId)
                        .orElseThrow(() -> new ResourceNotFoundException("Course combo not found with id: " + comboId));
                applicableCombos.add(combo);
            }
            voucher.setApplicableCombos(applicableCombos);
        }

        // Save voucher
        Voucher savedVoucher = voucherRepository.save(voucher);

        // Return response
        return mapToResponse(savedVoucher);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long voucherId, VoucherRequest request) {
        // Tìm voucher
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + voucherId));

        // Kiểm tra nếu code thay đổi và là duy nhất
        if (!voucher.getCode().equals(request.getCode()) &&
                voucherRepository.findByCodeAndIsActiveTrue(request.getCode()).isPresent()) {
            throw new BadRequestException("Voucher code already exists");
        }

        // Cập nhật các trường của voucher
        voucher.setCode(request.getCode());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinimumPurchaseAmount(request.getMinimumPurchaseAmount());
        voucher.setMaximumDiscountAmount(request.getMaximumDiscountAmount());
        voucher.setValidFrom(request.getValidFrom());
        voucher.setValidUntil(request.getValidUntil());
        voucher.setTotalUsageLimit(request.getTotalUsageLimit());
        voucher.setPerUserLimit(request.getPerUserLimit());

        // Lưu thay đổi cơ bản vào voucher
        voucher = voucherRepository.save(voucher);

        // Xử lý các khoá học áp dụng
        if (request.getApplicableCourseIds() != null) {
            // Xóa tất cả các liên kết khóa học hiện tại của voucher này
            voucherRepository.deleteAllApplicableCourses(voucherId);

            // Thêm các khóa học mới nếu có
            if (!request.getApplicableCourseIds().isEmpty()) {
                Set<Course> newCourses = new HashSet<>();
                for (Long courseId : request.getApplicableCourseIds()) {
                    Course course = courseRepository.findById(courseId)
                            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
                    newCourses.add(course);
                }
                voucher.setApplicableCourses(newCourses);
            } else {
                voucher.setApplicableCourses(new HashSet<>());
            }
        }

        // Xử lý combo áp dụng
        if (request.getApplicableComboIds() != null) {
            // Xóa tất cả các liên kết combo hiện tại của voucher này
            voucherRepository.deleteAllApplicableCombos(voucherId);

            // Thêm các combo mới nếu có
            if (!request.getApplicableComboIds().isEmpty()) {
                Set<CourseCombo> newCombos = new HashSet<>();
                for (Long comboId : request.getApplicableComboIds()) {
                    CourseCombo combo = comboRepository.findById(comboId)
                            .orElseThrow(() -> new ResourceNotFoundException("Course combo not found with id: " + comboId));
                    newCombos.add(combo);
                }
                voucher.setApplicableCombos(newCombos);
            } else {
                voucher.setApplicableCombos(new HashSet<>());
            }
        }

        // Lưu voucher đã cập nhật
        Voucher updatedVoucher = voucherRepository.save(voucher);

        // Trả về response
        return mapToResponse(updatedVoucher);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long voucherId) {
        // Find voucher
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + voucherId));

        // Soft delete by setting isActive to false
        voucher.setActive(false);
        voucherRepository.save(voucher);
    }

    @Override
    public VoucherResponse getVoucherById(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + voucherId));

        return mapToResponse(voucher);
    }

    @Override
    public VoucherResponse getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findValidVoucherByCode(code, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Valid voucher not found with code: " + code));

        return mapToResponse(voucher);
    }

    @Override
    public Page<VoucherResponse> getActiveVouchers(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        Page<Voucher> vouchers = voucherRepository.findByIsActiveTrue(pageable);

        return vouchers.map(this::mapToResponse);
    }

    @Override
    public List<VoucherResponse> getValidVouchersForCourse(Long courseId) {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> vouchers = voucherRepository.findValidVouchersByCourseId(courseId, now);

        return vouchers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VoucherResponse> getValidVouchersForCombo(Long comboId) {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> vouchers = voucherRepository.findValidVouchersByComboId(comboId, now);

        return vouchers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal calculateDiscount(String code, BigDecimal amount, Long courseId, Long comboId, Long studentId) {
        // Find valid voucher
        Voucher voucher;
        try {
            voucher = voucherRepository.findValidVoucherByCode(code, LocalDateTime.now())
                    .orElseThrow(() -> new BadRequestException("Invalid or expired voucher code"));
        } catch (Exception e) {
            return BigDecimal.ZERO; // Return zero discount if voucher not found or expired
        }

        if (voucher.getApplicableCourses() == null) {
            voucher.setApplicableCourses(new HashSet<>());
        }

        // Check if minimum purchase amount is met
        if (voucher.getMinimumPurchaseAmount() != null &&
                amount.compareTo(voucher.getMinimumPurchaseAmount()) < 0) {
            throw new BadRequestException("Purchase amount does not meet minimum requirement");
        }

        // Check usage limits
        if (voucher.getTotalUsageLimit() != null &&
                voucher.getUsageCount() >= voucher.getTotalUsageLimit()) {
            throw new BadRequestException("Voucher usage limit reached");
        }

        if (voucher.getPerUserLimit() != null) {
            Long userUsageCount = voucherUsageRepository.countByVoucherIdAndStudentId(voucher.getId(), studentId);
            if (userUsageCount >= voucher.getPerUserLimit()) {
                throw new BadRequestException("You have reached the usage limit for this voucher");
            }
        }

        // Check if voucher is applicable to the course or combo
        boolean isApplicable = true;

        if (courseId != null && !voucher.getApplicableCourses().isEmpty()) {
            isApplicable = voucher.getApplicableCourses().stream()
                    .anyMatch(course -> course.getId().equals(courseId));
        } else if (comboId != null && !voucher.getApplicableCombos().isEmpty()) {
            isApplicable = voucher.getApplicableCombos().stream()
                    .anyMatch(combo -> combo.getId().equals(comboId));
        }

        if (!isApplicable && (!voucher.getApplicableCourses().isEmpty() || !voucher.getApplicableCombos().isEmpty())) {
            throw new BadRequestException("Voucher not applicable to selected course or combo");
        }

        // Calculate discount
        BigDecimal discountAmount;
        if (voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE) {
            // Calculate percentage discount
            discountAmount = amount.multiply(voucher.getDiscountValue().divide(new BigDecimal(100)));
        } else {
            // Fixed amount discount
            discountAmount = voucher.getDiscountValue();

            // Ensure discount is not greater than amount
            if (discountAmount.compareTo(amount) > 0) {
                discountAmount = amount;
            }
        }

        // Apply maximum discount limit if set
        if (voucher.getMaximumDiscountAmount() != null &&
                discountAmount.compareTo(voucher.getMaximumDiscountAmount()) > 0) {
            discountAmount = voucher.getMaximumDiscountAmount();
        }

        return discountAmount;
    }

    // Helper methods

    private VoucherResponse mapToResponse(Voucher voucher) {
        // Map courses
        List<CourseBriefResponse> courses = new ArrayList<>();
        if (!voucher.getApplicableCourses().isEmpty()) {
            courses = voucher.getApplicableCourses().stream()
                    .map(course -> CourseBriefResponse.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .level(courseMapper.levelToResponse(course.getLevel()))
                            .price(course.getPrice())
                            .thumbnailUrl(course.getThumbnailUrl())
                            .countBuy(course.getCountBuy())
                            .tutor(courseMapper.tutorToBriefResponse(course.getTutor()))
                            .build())
                    .collect(Collectors.toList());
        }

        // Map combos
        List<ComboBriefResponse> combos = new ArrayList<>();
        if (!voucher.getApplicableCombos().isEmpty()) {
            combos = voucher.getApplicableCombos().stream()
                    .map(combo -> ComboBriefResponse.builder()
                            .id(combo.getId())
                            .title(combo.getTitle())
                            .originalPrice(combo.getOriginalPrice())
                            .discountPrice(combo.getDiscountPrice())
                            .discountPercentage(combo.getDiscountPercentage())
                            .thumbnailUrl(combo.getThumbnailUrl())
                            .courseCount(combo.getCourses().size())
                            .validUntil(combo.getValidUntil())
                            .build())
                    .collect(Collectors.toList());
        }

        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .minimumPurchaseAmount(voucher.getMinimumPurchaseAmount())
                .maximumDiscountAmount(voucher.getMaximumDiscountAmount())
                .validFrom(voucher.getValidFrom())
                .validUntil(voucher.getValidUntil())
                .totalUsageLimit(voucher.getTotalUsageLimit())
                .perUserLimit(voucher.getPerUserLimit())
                .usageCount(voucher.getUsageCount())
                .isActive(voucher.isActive())
                .applicableCourses(courses)
                .applicableCombos(combos)
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .build();
    }
}