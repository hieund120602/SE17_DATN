package com.jplearning.service;

import java.io.ByteArrayOutputStream;

public interface CertificateService {

    /**
     * Generate certificate PDF for a completed course enrollment
     */
    String generateCertificatePdf(Long enrollmentId);

    /**
     * Create certificate content as byte array
     */
    ByteArrayOutputStream createCertificateContent(String studentName, String courseName, String completionDate, String certificateId);

    /**
     * Upload certificate to Cloudinary and return URL
     */
    String uploadCertificateToCloudinary(ByteArrayOutputStream pdfContent, String certificateId);
} 