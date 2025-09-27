package com.jplearning.controller;

import com.jplearning.dto.response.CourseForLearningResponse;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.LearningService;
import com.jplearning.service.LessonCompletionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/learning")
@Tag(name = "Learning", description = "APIs for learning courses")
@CrossOrigin(origins = "*")
public class LearningController {

    @Autowired
    private LearningService learningService;

    @Autowired
    private LessonCompletionService lessonCompletionService;

    @GetMapping("/courses/{courseId}")
    @Operation(
            summary = "Get course for learning",
            description = "Get full course details with student progress for learning",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseForLearningResponse> getCourseForLearning(@PathVariable Long courseId) {
        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(learningService.getCourseForLearning(courseId, studentId));
    }

    @PostMapping("/lessons/{lessonId}/complete")
    @Operation(
            summary = "Mark lesson as completed",
            description = "Mark a lesson as completed for the current student",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<MessageResponse> markLessonAsCompleted(
            @PathVariable Long lessonId,
            @RequestParam Long courseId) {

        Long studentId = getCurrentUserId();
        return ResponseEntity.ok(lessonCompletionService.markLessonAsCompleted(lessonId, courseId, studentId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}