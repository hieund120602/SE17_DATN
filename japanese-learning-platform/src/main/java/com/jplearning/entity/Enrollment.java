package com.jplearning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion
    private Course course;

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "completed_lessons")
    private Integer completedLessons = 0;

    @Column(name = "last_accessed_lesson_id")
    private Long lastAccessedLessonId;

    @Column(name = "final_score")
    private Integer finalScore;

    @Column(name = "price_paid", nullable = false)
    private BigDecimal pricePaid;

    @Column(name = "is_completed")
    private boolean isCompleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    @JsonIgnore // Prevent infinite recursion
    private Payment payment;

    @Column(name = "certificate_id")
    private String certificateId;

    @Column(name = "certificate_url")
    private String certificateUrl;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_id")
    @JsonIgnore // Prevent infinite recursion
    private CourseCombo combo;

    @Column(name = "voucher_code")
    private String voucherCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}