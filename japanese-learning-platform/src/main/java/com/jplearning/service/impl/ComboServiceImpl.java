package com.jplearning.service.impl;

import com.jplearning.dto.request.ComboRequest;
import com.jplearning.dto.response.ComboBriefResponse;
import com.jplearning.dto.response.ComboResponse;
import com.jplearning.dto.response.CourseBriefResponse;
import com.jplearning.entity.Course;
import com.jplearning.entity.CourseCombo;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.CourseMapper;
import com.jplearning.repository.CourseComboRepository;
import com.jplearning.repository.CourseRepository;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.ComboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ComboServiceImpl implements ComboService {

    @Autowired
    private CourseComboRepository comboRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ComboResponse createCombo(ComboRequest request) {
        // Verify course IDs
        List<Course> courses = getCourses(request.getCourseIds());

        // Verify prices
        validatePrices(request);

        // Create combo
        CourseCombo combo = CourseCombo.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .originalPrice(request.getOriginalPrice())
                .discountPrice(request.getDiscountPrice())
                .discountPercentage(request.getDiscountPercentage())
                .thumbnailUrl(request.getThumbnailUrl())
                .isActive(request.getIsActive())
                .validUntil(request.getValidUntil())
                .accessPeriodMonths(request.getAccessPeriodMonths())
                .courses(new HashSet<>(courses))
                .build();

        CourseCombo savedCombo = comboRepository.save(combo);

        return mapToResponse(savedCombo);
    }

    @Override
    public ComboResponse getComboById(Long comboId) {
        CourseCombo combo = findComboById(comboId);
        return mapToResponse(combo);
    }

    @Override
    @Transactional
    public ComboResponse updateCombo(Long comboId, ComboRequest request) {
        CourseCombo combo = findComboById(comboId);

        // Verify course IDs
        List<Course> courses = getCourses(request.getCourseIds());

        // Verify prices
        validatePrices(request);

        // Update combo
        combo.setTitle(request.getTitle());
        combo.setDescription(request.getDescription());
        combo.setOriginalPrice(request.getOriginalPrice());
        combo.setDiscountPrice(request.getDiscountPrice());
        combo.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getThumbnailUrl() != null) {
            combo.setThumbnailUrl(request.getThumbnailUrl());
        }
        combo.setActive(request.getIsActive());
        combo.setValidUntil(request.getValidUntil());
        combo.setAccessPeriodMonths(request.getAccessPeriodMonths());
        combo.setCourses(new HashSet<>(courses));

        CourseCombo updatedCombo = comboRepository.save(combo);

        return mapToResponse(updatedCombo);
    }

    @Override
    @Transactional
    public ComboResponse uploadThumbnail(Long comboId, MultipartFile file) throws IOException {
        CourseCombo combo = findComboById(comboId);

        // Validate file
        validateImageFile(file);

        // Upload to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadImage(file);

        // Update combo
        combo.setThumbnailUrl(uploadResult.get("secureUrl"));
        CourseCombo updatedCombo = comboRepository.save(combo);

        return mapToResponse(updatedCombo);
    }

    @Override
    @Transactional
    public void deleteCombo(Long comboId) {
        CourseCombo combo = findComboById(comboId);
        comboRepository.delete(combo);
    }

    @Override
    public Page<ComboResponse> getActiveCombos(Pageable pageable) {
        Page<CourseCombo> combos = comboRepository.findByIsActiveTrueAndValidUntilAfter(
                LocalDateTime.now(), pageable);
        return combos.map(this::mapToResponse);
    }

    @Override
    public Page<ComboResponse> getAllCombos(Pageable pageable) {
        Page<CourseCombo> combos = comboRepository.findAll(pageable);
        return combos.map(this::mapToResponse);
    }

    @Override
    public List<ComboResponse> getCombosByCourse(Long courseId) {
        List<CourseCombo> combos = comboRepository.findActiveCombosByCourseId(courseId);
        return combos.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper methods

    private CourseCombo findComboById(Long comboId) {
        return comboRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found with id: " + comboId));
    }

    private List<Course> getCourses(List<Long> courseIds) {
        List<Course> courses = new ArrayList<>();
        for (Long courseId : courseIds) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

            // Verify course is approved
            if (course.getStatus() != Course.Status.APPROVED) {
                throw new BadRequestException("Course with id " + courseId + " is not approved");
            }

            courses.add(course);
        }
        return courses;
    }

    private void validatePrices(ComboRequest request) {
        // Original price should be greater than discount price
        if (request.getOriginalPrice().compareTo(request.getDiscountPrice()) <= 0) {
            throw new BadRequestException("Original price must be greater than discount price");
        }

        // Calculate discount percentage if not provided
        if (request.getDiscountPercentage() == null) {
            BigDecimal discount = request.getOriginalPrice().subtract(request.getDiscountPrice());
            BigDecimal percentage = discount.multiply(new BigDecimal(100))
                    .divide(request.getOriginalPrice(), 0, BigDecimal.ROUND_DOWN);
            request.setDiscountPercentage(percentage.intValue());
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File must be an image");
        }

        // Check file size (max 2MB for thumbnails)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestException("Image size should not exceed 2MB");
        }
    }

    private ComboResponse mapToResponse(CourseCombo combo) {
        List<CourseBriefResponse> courseResponses = combo.getCourses().stream()
                .map(course -> CourseBriefResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .level(courseMapper.levelToResponse(course.getLevel()))
                        .price(course.getPrice())
                        .thumbnailUrl(course.getThumbnailUrl())
                        .tutor(courseMapper.tutorToBriefResponse(course.getTutor()))
                        .countBuy(course.getCountBuy()) // Include countBuy field
                        .build())
                .collect(Collectors.toList());

        return ComboResponse.builder()
                .id(combo.getId())
                .title(combo.getTitle())
                .description(combo.getDescription())
                .originalPrice(combo.getOriginalPrice())
                .discountPrice(combo.getDiscountPrice())
                .discountPercentage(combo.getDiscountPercentage())
                .thumbnailUrl(combo.getThumbnailUrl())
                .isActive(combo.isActive())
                .courses(courseResponses)
                .validUntil(combo.getValidUntil())
                .accessPeriodMonths(combo.getAccessPeriodMonths())
                .createdAt(combo.getCreatedAt())
                .updatedAt(combo.getUpdatedAt())
                .build();
    }

    public ComboBriefResponse mapToBriefResponse(CourseCombo combo) {
        return ComboBriefResponse.builder()
                .id(combo.getId())
                .title(combo.getTitle())
                .originalPrice(combo.getOriginalPrice())
                .discountPrice(combo.getDiscountPrice())
                .discountPercentage(combo.getDiscountPercentage())
                .thumbnailUrl(combo.getThumbnailUrl())
                .courseCount(combo.getCourses().size())
                .validUntil(combo.getValidUntil())
                .build();
    }
}