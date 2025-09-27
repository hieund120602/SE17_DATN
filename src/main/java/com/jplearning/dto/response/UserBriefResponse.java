package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBriefResponse {
    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String userType; // "STUDENT", "TUTOR", or "ADMIN"
}
