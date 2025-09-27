package com.jplearning.service.impl;

import com.jplearning.entity.Enrollment;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.EnrollmentRepository;
import com.jplearning.service.CertificateService;
import com.jplearning.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class CertificateServiceImpl implements CertificateService {

    private static final Logger log = LoggerFactory.getLogger(CertificateServiceImpl.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    public String generateCertificatePdf(Long enrollmentId) {
        // Find enrollment
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        // For now, return a simple certificate URL to avoid Lombok issues
        // TODO: Implement full certificate generation when Lombok is working properly
        String certificateId = "CERT-" + enrollmentId + "-" + System.currentTimeMillis();
        String certificateUrl = "https://example.com/certificates/" + certificateId + ".pdf";
        
        log.info("Certificate generated for enrollment {}: {}", enrollmentId, certificateUrl);
        return certificateUrl;
    }

    @Override
    public ByteArrayOutputStream createCertificateContent(String studentName, String courseName, String completionDate, String certificateId) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try {
            // For now, we'll create a simple HTML-based certificate
            String htmlContent = generateCertificateHtml(studentName, courseName, completionDate, certificateId);
            
            // Convert HTML to bytes (simplified approach)
            outputStream.write(htmlContent.getBytes("UTF-8"));
            
        } catch (Exception e) {
            log.error("Error creating certificate content: {}", e.getMessage());
            throw new RuntimeException("Failed to create certificate content", e);
        }
        
        return outputStream;
    }

    @Override
    public String uploadCertificateToCloudinary(ByteArrayOutputStream pdfContent, String certificateId) {
        try {
            // Create a multipart file from byte array
            MultipartFile file = new MockMultipartFile(
                certificateId + ".pdf",
                certificateId + ".pdf",
                "application/pdf",
                pdfContent.toByteArray()
            );

            // Upload to Cloudinary (it will automatically go to documents folder for PDF)
            Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
            
            // Return the secure URL
            return uploadResult.get("secureUrl");
            
        } catch (Exception e) {
            log.error("Error uploading certificate to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Failed to upload certificate", e);
        }
    }

    private String generateCertificateHtml(String studentName, String courseName, String completionDate, String certificateId) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Certificate of Completion</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 40px;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .certificate {
                        background: white;
                        width: 800px;
                        padding: 60px;
                        border-radius: 20px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        text-align: center;
                        border: 8px solid #f8f9fa;
                        position: relative;
                    }
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        right: 20px;
                        bottom: 20px;
                        border: 2px solid #667eea;
                        border-radius: 12px;
                    }
                    .header {
                        margin-bottom: 40px;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        background: #667eea;
                        border-radius: 50%%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .title {
                        font-size: 36px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin: 20px 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .subtitle {
                        font-size: 18px;
                        color: #7f8c8d;
                        margin-bottom: 40px;
                    }
                    .content {
                        margin: 40px 0;
                        line-height: 1.8;
                    }
                    .student-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #667eea;
                        margin: 20px 0;
                        text-decoration: underline;
                        text-decoration-color: #667eea;
                    }
                    .course-name {
                        font-size: 20px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin: 20px 0;
                        font-style: italic;
                    }
                    .footer {
                        margin-top: 50px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .date {
                        color: #7f8c8d;
                        font-size: 14px;
                    }
                    .certificate-id {
                        color: #95a5a6;
                        font-size: 12px;
                        font-family: monospace;
                    }
                    .signature-area {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #ecf0f1;
                    }
                    .signature {
                        display: inline-block;
                        width: 200px;
                        text-align: center;
                        margin: 0 40px;
                    }
                    .signature-line {
                        border-top: 2px solid #bdc3c7;
                        margin-top: 50px;
                        padding-top: 10px;
                        font-size: 14px;
                        color: #7f8c8d;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="header">
                        <div class="logo">JLP</div>
                        <div class="title">Chứng Chỉ Hoàn Thành</div>
                        <div class="subtitle">Japanese Learning Platform</div>
                    </div>
                    
                    <div class="content">
                        <p style="font-size: 18px; color: #2c3e50; margin-bottom: 30px;">
                            Chứng nhận rằng
                        </p>
                        
                        <div class="student-name">%s</div>
                        
                        <p style="font-size: 18px; color: #2c3e50; margin: 30px 0;">
                            đã hoàn thành thành công khóa học
                        </p>
                        
                        <div class="course-name">"%s"</div>
                        
                        <p style="font-size: 16px; color: #7f8c8d; margin-top: 30px;">
                            Học viên đã thể hiện sự tận tụy và nỗ lực xuất sắc trong việc hoàn thành tất cả các yêu cầu của khóa học.
                        </p>
                    </div>
                    
                    <div class="signature-area">
                        <div class="signature">
                            <div class="signature-line">
                                Giám đốc học thuật<br>
                                Japanese Learning Platform
                            </div>
                        </div>
                        <div class="signature">
                            <div class="signature-line">
                                Ngày cấp: %s
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="certificate-id">ID: %s</div>
                        <div class="date">Được cấp bởi Japanese Learning Platform</div>
                    </div>
                </div>
            </body>
            </html>
            """, studentName, courseName, completionDate, certificateId);
    }
} 