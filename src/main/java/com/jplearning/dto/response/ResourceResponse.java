package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResourceResponse {
    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private String fileType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}