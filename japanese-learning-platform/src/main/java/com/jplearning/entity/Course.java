package com.jplearning.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_in_minutes")
    private Integer durationInMinutes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @Column(name = "lesson_count")
    private Integer lessonCount;

    @Column(columnDefinition = "TEXT", name = "course_overview")
    private String courseOverview;

    @Column(columnDefinition = "TEXT", name = "course_content")
    private String courseContent;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "includes_description", columnDefinition = "TEXT")
    private String includesDescription;

    @Column(name = "count_buy", nullable = false)
    private Integer countBuy = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Added to break circular reference
    @Builder.Default
    private List<Module> modules = new ArrayList<>();

    // Enum for course status
    public enum Status {
        DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
    }

    // Override toString to avoid circular reference
    @Override
    public String toString() {
        return "Course{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", durationInMinutes=" + durationInMinutes +
                ", lessonCount=" + lessonCount +
                ", price=" + price +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}