package com.jplearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "course_combos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCombo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "original_price", nullable = false)
    private BigDecimal originalPrice;

    @Column(name = "discount_price", nullable = false)
    private BigDecimal discountPrice;

    @Column(name = "discount_percentage")
    private Integer discountPercentage;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @ManyToMany
    @JoinTable(
            name = "combo_courses",
            joinColumns = @JoinColumn(name = "combo_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "access_period_months")
    private Integer accessPeriodMonths;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}