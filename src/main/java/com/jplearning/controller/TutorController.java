package com.jplearning.controller;

import com.jplearning.dto.response.UserResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.TutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/tutors")
@Tag(name = "Tutor", description = "Tutor API")
@CrossOrigin(origins = "*")
public class TutorController {

    @Autowired
    private TutorService tutorService;

    @PostMapping(value = "/me/certificates", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload certificate",
            description = "Upload a new certificate for the current tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<UserResponse> uploadCertificate(@RequestParam("file") MultipartFile file) {
        try {
            Long tutorId = getCurrentUserId();
            return ResponseEntity.ok(tutorService.uploadCertificate(tutorId, file));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload certificate: " + e.getMessage());
        }
    }

    @DeleteMapping("/me/certificates")
    @Operation(
            summary = "Delete certificate",
            description = "Delete a certificate for the current tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<UserResponse> deleteCertificate(@RequestParam String certificateUrl) {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(tutorService.deleteCertificate(tutorId, certificateUrl));
    }

    @GetMapping("/me/certificates")
    @Operation(
            summary = "Get certificates",
            description = "Get all certificates for the current tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<String>> getCertificates() {
        Long tutorId = getCurrentUserId();
        return ResponseEntity.ok(tutorService.getCertificates(tutorId));
    }

    @PostMapping(value = "/{tutorId}/certificates", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload certificate for tutor",
            description = "Admin can upload a new certificate for any tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> uploadCertificateForTutor(
            @PathVariable Long tutorId,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(tutorService.uploadCertificate(tutorId, file));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload certificate: " + e.getMessage());
        }
    }

    @DeleteMapping("/{tutorId}/certificates")
    @Operation(
            summary = "Delete certificate for tutor",
            description = "Admin can delete a certificate for any tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> deleteCertificateForTutor(
            @PathVariable Long tutorId,
            @RequestParam String certificateUrl) {
        return ResponseEntity.ok(tutorService.deleteCertificate(tutorId, certificateUrl));
    }

    @GetMapping("/{tutorId}/certificates")
    @Operation(
            summary = "Get certificates for tutor",
            description = "Get all certificates for a specific tutor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getCertificatesForTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(tutorService.getCertificates(tutorId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}