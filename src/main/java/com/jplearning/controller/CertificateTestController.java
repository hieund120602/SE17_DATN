package com.jplearning.controller;

import com.jplearning.service.CourseCompletionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test/certificate")
@CrossOrigin(origins = "*")
public class CertificateTestController {

    @Autowired
    private CourseCompletionService courseCompletionService;

    @PostMapping("/check-completion/{enrollmentId}")
    public ResponseEntity<String> checkCourseCompletion(@PathVariable Long enrollmentId) {
        try {
            boolean isCompleted = courseCompletionService.checkAndProcessCourseCompletion(enrollmentId);
            if (isCompleted) {
                return ResponseEntity.ok("Khóa học đã được hoàn thành và certificate đã được tạo!");
            } else {
                return ResponseEntity.ok("Khóa học chưa hoàn thành. Vui lòng hoàn thành tất cả bài học.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/status/{enrollmentId}")
    public ResponseEntity<String> getCourseCompletionStatus(@PathVariable Long enrollmentId) {
        try {
            boolean isCompleted = courseCompletionService.isCourseCompleted(enrollmentId);
            return ResponseEntity.ok("Trạng thái hoàn thành: " + (isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/generate/{enrollmentId}")
    public ResponseEntity<String> generateCertificate(@PathVariable Long enrollmentId) {
        try {
            String certificateUrl = courseCompletionService.generateCertificateForCompletedCourse(enrollmentId);
            return ResponseEntity.ok("Certificate đã được tạo: " + certificateUrl);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }
}
