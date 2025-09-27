package com.jplearning.service;

import com.jplearning.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface TutorService {
    /**
     * Upload certificate for tutor
     * @param tutorId ID of the tutor
     * @param file Certificate file to upload
     * @return Updated tutor details
     * @throws IOException If an I/O error occurs
     */
    UserResponse uploadCertificate(Long tutorId, MultipartFile file) throws IOException;

    /**
     * Delete certificate for tutor
     * @param tutorId ID of the tutor
     * @param certificateUrl URL of the certificate to delete
     * @return Updated tutor details
     */
    UserResponse deleteCertificate(Long tutorId, String certificateUrl);

    /**
     * Get all certificates for tutor
     * @param tutorId ID of the tutor
     * @return List of certificate URLs
     */
    List<String> getCertificates(Long tutorId);
}