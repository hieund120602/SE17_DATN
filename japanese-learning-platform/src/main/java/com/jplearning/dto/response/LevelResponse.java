package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LevelResponse {
    private Long id;
    private String name;
    private String description;
    private int courseCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}