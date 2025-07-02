package com.jplearning.service.impl;

import com.jplearning.dto.response.UserResponse;
import com.jplearning.entity.Tutor;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.TutorRepository;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.TutorService;
import com.jplearning.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class TutorServiceImpl implements TutorService {
    private static final Logger logger = LoggerFactory.getLogger(TutorServiceImpl.class);

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserService userService;

    @Override
    public UserResponse uploadCertificate(Long tutorId, MultipartFile file) throws IOException {
        // Validate current user is the same tutor or an admin
        validatePermission(tutorId);

        // Validate file
        validateCertificateFile(file);

        // Get tutor
        Tutor tutor = getTutor(tutorId);

        // Upload certificate to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
        String certificateUrl = uploadResult.get("secureUrl");

        // Add certificate URL to tutor's certificateUrls
        if (tutor.getCertificateUrls() == null) {
            tutor.setCertificateUrls(new ArrayList<>());
        }
        tutor.getCertificateUrls().add(certificateUrl);
        tutorRepository.save(tutor);

        // Return updated tutor info
        return userService.getCurrentUser();
    }

    @Override
    public UserResponse deleteCertificate(Long tutorId, String certificateUrl) {
        // Validate current user is the same tutor or an admin
        validatePermission(tutorId);

        // Get tutor
        Tutor tutor = getTutor(tutorId);

        // Check if certificate URL exists in tutor's certificateUrls
        List<String> certificateUrls = tutor.getCertificateUrls();
        if (certificateUrls == null || !certificateUrls.contains(certificateUrl)) {
            throw new ResourceNotFoundException("Certificate URL not found");
        }

        // Remove certificate URL from tutor's certificateUrls
        certificateUrls.remove(certificateUrl);
        tutorRepository.save(tutor);

        // Delete certificate from Cloudinary (extract public ID from URL)
        try {
            String publicId = extractPublicIdFromUrl(certificateUrl);
            if (publicId != null) {
                cloudinaryService.deleteFile(publicId);
            }
        } catch (Exception e) {
            logger.error("Failed to delete certificate from Cloudinary: {}", e.getMessage());
            // Continue anyway since we've already removed the URL from the tutor's profile
        }

        // Return updated tutor info
        return userService.getCurrentUser();
    }

    @Override
    public List<String> getCertificates(Long tutorId) {
        // Get tutor
        Tutor tutor = getTutor(tutorId);

        // Return certificate URLs
        return tutor.getCertificateUrls() != null ? tutor.getCertificateUrls() : new ArrayList<>();
    }

    private Tutor getTutor(Long tutorId) {
        return tutorRepository.findById(tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor not found with id: " + tutorId));
    }

    private void validatePermission(Long tutorId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!userDetails.getId().equals(tutorId) && !isAdmin) {
            throw new AccessDeniedException("You don't have permission to manage this tutor's certificates");
        }
    }

    private void validateCertificateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Certificate file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("Content type is missing");
        }

        // Allow common document types for certificates
        boolean isValidType = contentType.equals("application/pdf")
                || contentType.equals("image/jpeg")
                || contentType.equals("image/png")
                || contentType.equals("image/jpg");

        if (!isValidType) {
            throw new BadRequestException("Certificate must be a PDF or image file (JPEG, PNG)");
        }

        // Check file size (max 5MB for certificates)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Certificate file size should not exceed 5MB");
        }
    }

    private String extractPublicIdFromUrl(String url) {
        // Example Cloudinary URL: https://res.cloudinary.com/demo/image/upload/v1234567890/japanese_learning/sample.jpg
        // Public ID: japanese_learning/sample

        if (url == null || !url.contains("/upload/")) {
            return null;
        }

        try {
            String[] parts = url.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            String afterUpload = parts[1];
            // Remove version if exists
            if (afterUpload.startsWith("v")) {
                int nextSlash = afterUpload.indexOf("/");
                if (nextSlash != -1) {
                    afterUpload = afterUpload.substring(nextSlash + 1);
                }
            }

            // Remove file extension
            int lastDot = afterUpload.lastIndexOf(".");
            if (lastDot != -1) {
                afterUpload = afterUpload.substring(0, lastDot);
            }

            return afterUpload;
        } catch (Exception e) {
            logger.error("Failed to extract public ID from URL: {}", e.getMessage());
            return null;
        }
    }
}