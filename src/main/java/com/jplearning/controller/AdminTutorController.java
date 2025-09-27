package com.jplearning.controller;

import com.jplearning.dto.request.UpdateTutorProfileRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.TutorResponse;
import com.jplearning.service.AdminTutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/tutors")
@Tag(name = "Admin Tutor Management", description = "Admin APIs for managing tutors")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTutorController {

    @Autowired
    private AdminTutorService adminTutorService;

    @GetMapping
    @Operation(summary = "Get all tutors with pagination", description = "Retrieve paginated list of all tutors")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<TutorResponse>> getAllTutors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TutorResponse> tutors = adminTutorService.getAllTutors(pageable);
        return ResponseEntity.ok(tutors);
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending tutors", description = "Retrieve list of tutors waiting for approval")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<TutorResponse>> getPendingTutors() {
        Pageable pageable = PageRequest.of(0, 100); // Get all pending tutors
        Page<TutorResponse> pendingTutors = adminTutorService.getPendingTutors(pageable);
        return ResponseEntity.ok(pendingTutors);
    }

    @PostMapping("/{tutorId}/approve")
    @Operation(summary = "Approve tutor", description = "Approve a pending tutor application")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageResponse> approveTutor(@PathVariable Long tutorId) {
        MessageResponse response = adminTutorService.approveTutor(tutorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{tutorId}/reject")
    @Operation(summary = "Reject tutor", description = "Reject a pending tutor application with reason")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageResponse> rejectTutor(
            @PathVariable Long tutorId,
            @RequestBody RejectTutorRequest request
    ) {
        MessageResponse response = adminTutorService.rejectTutor(tutorId, request.getReason());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{tutorId}/profile")
    @Operation(summary = "Update tutor profile", description = "Update tutor profile information")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<TutorResponse> updateTutorProfile(
            @PathVariable Long tutorId,
            @RequestBody UpdateTutorProfileRequest request
    ) {
        TutorResponse updatedTutor = adminTutorService.updateTutorProfile(tutorId, request);
        return ResponseEntity.ok(updatedTutor);
    }

    // Inner class for reject request
    public static class RejectTutorRequest {
        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
