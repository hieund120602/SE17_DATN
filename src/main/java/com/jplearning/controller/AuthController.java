package com.jplearning.controller;

import com.jplearning.dto.request.*;
import com.jplearning.dto.response.JwtResponse;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.logging.Logger;
import com.jplearning.dto.response.CertificateUploadResponse;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication API")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and generate JWT token")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/register/student")
    @Operation(summary = "Register student", description = "Register new student account")
    public ResponseEntity<MessageResponse> registerStudent(@Valid @RequestBody RegisterStudentRequest registerRequest) {
        return ResponseEntity.ok(authService.registerStudent(registerRequest));
    }

    @PostMapping(value = "/register/tutor", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Register tutor", description = "Register new tutor account with certificate URLs")
    public ResponseEntity<MessageResponse> registerTutor(
            @ModelAttribute TutorRegistrationUploadRequest uploadRequest
    ) {
        // Convert to RegisterTutorRequest
        RegisterTutorRequest registerRequest = new RegisterTutorRequest();
        registerRequest.setFullName(uploadRequest.getFullName());
        registerRequest.setEmail(uploadRequest.getEmail());
        registerRequest.setPhoneNumber(uploadRequest.getPhoneNumber());
        registerRequest.setPassword(uploadRequest.getPassword());
        registerRequest.setConfirmPassword(uploadRequest.getConfirmPassword());
        registerRequest.setIdentityCardNumber(uploadRequest.getIdentityCardNumber());
        registerRequest.setHomeAddress(uploadRequest.getHomeAddress());
        registerRequest.setTeachingRequirements(uploadRequest.getTeachingRequirements());
        
        // TODO: Parse JSON strings for complex objects (educations, experiences)
        // This would need to be implemented based on your JSON parsing logic
        
        // Convert certificate URLs from string to list
        if (uploadRequest.getCertificateUrls() != null && !uploadRequest.getCertificateUrls().isEmpty()) {
            registerRequest.setCertificateUrls(uploadRequest.getCertificateUrls());
        }
        
        return ResponseEntity.ok(authService.registerTutor(registerRequest));
    }

    @PostMapping(value = "/upload-certificate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload certificate file", description = "Upload a certificate file and return the URL")
    public ResponseEntity<CertificateUploadResponse> uploadCertificate(@RequestParam("file") MultipartFile file) {
        try {
            String certificateUrl = authService.uploadCertificateFile(file);
            return ResponseEntity.ok(new CertificateUploadResponse(certificateUrl));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload certificate: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Request password reset email")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using token")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/change-password")
    @Operation(
            summary = "Change password",
            description = "Change password for authenticated user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(authService.changePassword(request, userId));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verify user email with token")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        if (token == null || token.isEmpty()) {
            throw new BadRequestException("Verification token is required");
        }

        MessageResponse response = authService.verifyEmail(token);

        if (response.getMessage().startsWith("Error")) {
            throw new BadRequestException(response.getMessage().replace("Error verifying email: ", ""));
        }

        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        // Use reflection to access the id field since it's private
        try {
            java.lang.reflect.Field idField = UserDetailsImpl.class.getDeclaredField("id");
            idField.setAccessible(true);
            return (Long) idField.get(userDetails);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get user ID", e);
        }
    }
}