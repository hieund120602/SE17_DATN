package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComboBriefResponse {
    private Long id;
    private String title;
    private BigDecimal originalPrice;
    private BigDecimal discountPrice;
    private Integer discountPercentage;
    private String thumbnailUrl;
    private Integer courseCount;
}