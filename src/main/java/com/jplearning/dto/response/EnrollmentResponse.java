package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private Long id;
    private StudentBriefResponse student;
    private CourseResponse course;
    private Integer progressPercentage;
    private Integer completedLessons;
    private Long lastAccessedLessonId;
    private Integer finalScore;
    private BigDecimal pricePaid;
    private boolean isCompleted;
    private String certificateId;
    private String certificateUrl;
    private LocalDateTime expiryDate;
    private Long comboId;
    private String voucherCode;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;
}