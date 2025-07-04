package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechExerciseStatsResponse {
    private Long totalAttempts;
    private Long totalPassed;
    private Double averageAccuracyScore;
    private Double passRate;
    private Long totalTimeSpent; // in seconds
    private Integer currentStreak;
    private Integer longestStreak;
}