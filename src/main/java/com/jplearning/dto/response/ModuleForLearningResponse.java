package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleForLearningResponse {
    private Long id;
    private String title;
    private Integer durationInMinutes;
    private Integer position;
    private List<LessonForLearningResponse> lessons;
}
