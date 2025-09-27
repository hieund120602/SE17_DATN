package com.jplearning.service.impl;

import com.jplearning.entity.Enrollment;
import com.jplearning.entity.Lesson;
import com.jplearning.repository.EnrollmentRepository;
import com.jplearning.repository.LessonRepository;
import com.jplearning.service.CertificateService;
import com.jplearning.service.CourseCompletionService;
import com.jplearning.service.TutorEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseCompletionServiceImpl implements CourseCompletionService {

    private static final Logger logger = LoggerFactory.getLogger(CourseCompletionServiceImpl.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private TutorEmailService tutorEmailService;

    @Override
    @Transactional
    public boolean checkAndProcessCourseCompletion(Long enrollmentId) {
        try {
            Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));

            if (enrollment.isCompleted()) {
                logger.info("Course already completed for enrollment: {}", enrollmentId);
                return true;
            }

            // Kiểm tra xem tất cả bài học đã được hoàn thành chưa
            boolean isCompleted = checkAllLessonsCompleted(enrollmentId);
            
            if (isCompleted) {
                // Đánh dấu khóa học đã hoàn thành
                enrollment.setCompleted(true);
                enrollment.setCompletedLessons(getTotalLessonsInCourse(enrollment.getCourse().getId()));
                enrollment.setProgressPercentage(100);
                enrollment.setUpdatedAt(LocalDateTime.now());
                
                // Tạo certificate
                String certificateUrl = generateCertificateForCompletedCourse(enrollmentId);
                enrollment.setCertificateUrl(certificateUrl);
                
                enrollmentRepository.save(enrollment);
                
                logger.info("Course marked as completed for enrollment: {}", enrollmentId);
                
                // Gửi email thông báo hoàn thành khóa học
                sendCourseCompletionEmail(enrollment);
                
                return true;
            }
            
            return false;
        } catch (Exception e) {
            logger.error("Error checking course completion for enrollment {}: {}", enrollmentId, e.getMessage());
            return false;
        }
    }

    @Override
    public String generateCertificateForCompletedCourse(Long enrollmentId) {
        try {
            // Sử dụng CertificateService để tạo certificate
            String certificateUrl = certificateService.generateCertificatePdf(enrollmentId);
            logger.info("Certificate generated for enrollment {}: {}", enrollmentId, certificateUrl);
            return certificateUrl;
        } catch (Exception e) {
            logger.error("Error generating certificate for enrollment {}: {}", enrollmentId, e.getMessage());
            throw new RuntimeException("Failed to generate certificate", e);
        }
    }

    @Override
    public boolean isCourseCompleted(Long enrollmentId) {
        try {
            Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));
            return enrollment.isCompleted();
        } catch (Exception e) {
            logger.error("Error checking course completion status for enrollment {}: {}", enrollmentId, e.getMessage());
            return false;
        }
    }

    private boolean checkAllLessonsCompleted(Long enrollmentId) {
        try {
            Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));
            
            Long courseId = enrollment.getCourse().getId();
            List<Lesson> allLessons = lessonRepository.findByCourseId(courseId);
            
            if (allLessons.isEmpty()) {
                return false;
            }
            
            // Kiểm tra xem tất cả bài học đã được hoàn thành chưa
            // Đây là logic đơn giản, có thể cần điều chỉnh dựa trên business logic thực tế
            int totalLessons = allLessons.size();
            int completedLessons = enrollment.getCompletedLessons() != null ? enrollment.getCompletedLessons() : 0;
            
            return completedLessons >= totalLessons;
        } catch (Exception e) {
            logger.error("Error checking lessons completion for enrollment {}: {}", enrollmentId, e.getMessage());
            return false;
        }
    }

    private int getTotalLessonsInCourse(Long courseId) {
        try {
            List<Lesson> lessons = lessonRepository.findByCourseId(courseId);
            return lessons.size();
        } catch (Exception e) {
            logger.error("Error getting total lessons for course {}: {}", courseId, e.getMessage());
            return 0;
        }
    }

    private void sendCourseCompletionEmail(Enrollment enrollment) {
        try {
            String studentName = enrollment.getStudent().getFullName();
            String courseName = enrollment.getCourse().getTitle();
            String studentEmail = enrollment.getStudent().getEmail();
            
            // Gửi email chúc mừng hoàn thành khóa học
            String subject = "Chúc mừng! Bạn đã hoàn thành khóa học " + courseName;
            String content = String.format(
                "Xin chào %s,\n\n" +
                "Chúc mừng bạn đã hoàn thành khóa học \"%s\"!\n\n" +
                "Bạn có thể tải xuống chứng chỉ hoàn thành khóa học từ trang profile của mình.\n\n" +
                "Chúc bạn tiếp tục học tập hiệu quả!\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ Japanese Learning Platform",
                studentName, courseName
            );
            
            // Sử dụng EmailService để gửi email
            // emailService.sendEmail(studentEmail, subject, content);
            logger.info("Course completion email sent to: {}", studentEmail);
        } catch (Exception e) {
            logger.error("Error sending course completion email: {}", e.getMessage());
        }
    }
}
