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
public class CourseBriefResponse {
    private Long id;
    private String title;
    private LevelResponse level;
    private BigDecimal price;
    private String thumbnailUrl;
    private TutorBriefResponse tutor;
    private Integer countBuy;
}