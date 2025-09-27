package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComboResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal originalPrice;
    private BigDecimal discountPrice;
    private Integer discountPercentage;
    private String thumbnailUrl;
    private boolean isActive;
    private List<CourseBriefResponse> courses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}