package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TutorBriefResponse {
    private Long id;
    private String fullName;
    private String avatarUrl;
    private String teachingRequirements;
}