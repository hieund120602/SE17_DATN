package com.jplearning.service.impl;

import com.jplearning.dto.response.CourseResponse;
import com.jplearning.dto.response.EnrollmentResponse;
import com.jplearning.dto.response.StudentBriefResponse;
import com.jplearning.entity.*;
import com.jplearning.entity.Module;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.CourseMapper;
import com.jplearning.repository.*;
import com.jplearning.service.CloudinaryService;
import com.jplearning.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseComboRepository comboRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private CloudinaryService cloudinaryService;


    @Override
    public boolean isStudentEnrolledInCourse(Long studentId, Long courseId) {
        Optional<Enrollment> enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
        boolean isEnrolled = enrollment.isPresent();
        System.out.println("Checking enrollment: studentId=" + studentId + ", courseId=" + courseId + ", isEnrolled=" + isEnrolled);
        return isEnrolled;
    }

    @Override
    @Transactional
    public EnrollmentResponse enrollStudentInCourse(Long studentId, Long courseId, Payment payment) {
        // Find student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Find course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Check if course is approved
        if (course.getStatus() != Course.Status.APPROVED) {
            throw new BadRequestException("Course is not available for enrollment");
        }

        // Check if student is already enrolled
        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByStudentAndCourse(student, course);
        if (existingEnrollment.isPresent()) {
            throw new BadRequestException("Student is already enrolled in this course");
        }

        // Create enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercentage(0)
                .completedLessons(0)
                .pricePaid(payment != null ? payment.getAmount() : course.getPrice())
                .payment(payment)
                .build();

        // Save enrollment
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        System.out.println("Enrollment saved with ID: " + savedEnrollment.getId());

        // Increment course countBuy and save
        course.setCountBuy(course.getCountBuy() != null ? course.getCountBuy() + 1 : 1);
        courseRepository.save(course);

        // Return response
        return mapToResponse(savedEnrollment);
    }

    @Override
    @Transactional
    public List<EnrollmentResponse> enrollStudentInCombo(Long studentId, Long comboId, Payment payment) {
        // Find student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Find combo
        CourseCombo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Course combo not found with id: " + comboId));

        // Check if combo is active
        if (!combo.isActive() || (combo.getValidUntil() != null && combo.getValidUntil().isBefore(LocalDateTime.now()))) {
            throw new BadRequestException("Course combo is not available for enrollment");
        }

        // Determine price per course
        BigDecimal pricePerCourse;
        if (combo.getCourses().size() > 0) {
            pricePerCourse = combo.getDiscountPrice().divide(BigDecimal.valueOf(combo.getCourses().size()));
        } else {
            throw new BadRequestException("Combo has no courses");
        }

        // Enroll student in all courses in the combo
        List<EnrollmentResponse> enrollments = new ArrayList<>();
        for (Course course : combo.getCourses()) {
            // Skip if already enrolled
            Optional<Enrollment> existingEnrollment = enrollmentRepository.findByStudentAndCourse(student, course);
            if (existingEnrollment.isPresent()) {
                continue;
            }

            // Create enrollment for this course
            Enrollment enrollment = Enrollment.builder()
                    .student(student)
                    .course(course)
                    .progressPercentage(0)
                    .completedLessons(0)
                    .pricePaid(pricePerCourse)
                    .payment(payment)
                    .combo(combo)
                    .build();

            // Set expiry date if applicable
            if (combo.getAccessPeriodMonths() != null && combo.getAccessPeriodMonths() > 0) {
                enrollment.setExpiryDate(LocalDateTime.now().plusMonths(combo.getAccessPeriodMonths()));
            }

            // Save enrollment
            Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

            // Increment course countBuy and save
            course.setCountBuy(course.getCountBuy() != null ? course.getCountBuy() + 1 : 1);
            courseRepository.save(course);

            enrollments.add(mapToResponse(savedEnrollment));
        }

        return enrollments;
    }

    @Override
    public boolean isStudentEnrolledInCombo(Long studentId, Long comboId) {
        // Check if any enrollments for this student belong to this combo
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndComboId(studentId, comboId);
        
        boolean isEnrolled = !enrollments.isEmpty();
        System.out.println("Checking combo enrollment: studentId=" + studentId + 
                          ", comboId=" + comboId + ", isEnrolled=" + isEnrolled);
        return isEnrolled;
    }

    // Rest of the methods remain unchanged

    public void debugEnrollmentCheck(Long studentId, Long courseId) {
        System.out.println("\n--- DEBUGGING ENROLLMENT CHECK ---");
        System.out.println("StudentId: " + studentId);
        System.out.println("CourseId: " + courseId);

        try {
            // Check direct SQL
            Optional<Enrollment> enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
            System.out.println("Enrollment found: " + enrollment.isPresent());

            // Check with entities
            Student student = studentRepository.findById(studentId).orElse(null);
            Course course = courseRepository.findById(courseId).orElse(null);

            System.out.println("Student null? " + (student == null));
            System.out.println("Course null? " + (course == null));

            if (student != null && course != null) {
                Optional<Enrollment> enrollmentByEntities = enrollmentRepository.findByStudentAndCourse(student, course);
                System.out.println("Enrollment found by entities: " + enrollmentByEntities.isPresent());
            }
        } catch (Exception e) {
            System.out.println("Error during debug: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("--- END DEBUGGING ---\n");
    }

    @Override
    public List<EnrollmentResponse> getStudentEnrollments(Long studentId) {
        // Find student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Get all enrollments
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        // Map to responses
        return enrollments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EnrollmentResponse updateProgress(Long enrollmentId, Long lessonId) {
        // Find enrollment
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        // Find lesson
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        // Verify lesson belongs to enrolled course
        if (!lesson.getModule().getCourse().getId().equals(enrollment.getCourse().getId())) {
            throw new BadRequestException("Lesson does not belong to the enrolled course");
        }

        // Update last accessed lesson
        enrollment.setLastAccessedLessonId(lessonId);

        // Count completed lessons if not already marked
        boolean alreadyCompleted = enrollment.getCompletedLessons() > 0 &&
                enrollment.getLastAccessedLessonId() != null &&
                enrollment.getLastAccessedLessonId().equals(lessonId);

        if (!alreadyCompleted) {
            // Increment completed lessons
            enrollment.setCompletedLessons(enrollment.getCompletedLessons() + 1);

            // Calculate progress percentage
            int totalLessons = countTotalLessons(enrollment.getCourse());
            if (totalLessons > 0) {
                int progressPercentage = (enrollment.getCompletedLessons() * 100) / totalLessons;
                enrollment.setProgressPercentage(Math.min(progressPercentage, 100)); // Cap at 100%

                // Check if course is completed
                if (enrollment.getProgressPercentage() >= 100) {
                    enrollment.setCompleted(true);
                    enrollment.setCompletedAt(LocalDateTime.now());
                }
            }
        }

        // Save updated enrollment
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);

        // Return response
        return mapToResponse(updatedEnrollment);
    }

    @Override
    public String generateCertificate(Long enrollmentId) {
        // Find enrollment
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        // Check if course is completed
        if (!enrollment.isCompleted()) {
            throw new BadRequestException("Course must be completed to generate certificate");
        }

        // Check if certificate already exists
        if (enrollment.getCertificateUrl() != null && !enrollment.getCertificateUrl().isEmpty()) {
            return enrollment.getCertificateUrl();
        }

        // In a real implementation, generate a PDF certificate and upload to Cloudinary
        // For this example, we'll just create a dummy certificate URL
        String certificateId = "CERT-" + enrollment.getStudent().getId() + "-" +
                enrollment.getCourse().getId() + "-" + System.currentTimeMillis();
        enrollment.setCertificateId(certificateId);

        // TODO: Generate actual certificate PDF and upload to Cloudinary
        String certificateUrl = "https://example.com/certificates/" + certificateId + ".pdf";
        enrollment.setCertificateUrl(certificateUrl);

        // Save updated enrollment
        enrollmentRepository.save(enrollment);

        return certificateUrl;
    }

    // Helper methods

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        StudentBriefResponse studentResponse = null;
        if (enrollment.getStudent() != null) {
            studentResponse = StudentBriefResponse.builder()
                    .id(enrollment.getStudent().getId())
                    .fullName(enrollment.getStudent().getFullName())
                    .email(enrollment.getStudent().getEmail())
                    .avatarUrl(enrollment.getStudent().getAvatarUrl())
                    .build();
        }

        CourseResponse courseResponse = null;
        if (enrollment.getCourse() != null) {
            courseResponse = courseMapper.courseToResponse(enrollment.getCourse());
            // Set enrolled to true since this is an enrollment
            courseResponse.setEnrolled(true);
        }

        Long comboId = enrollment.getCombo() != null ? enrollment.getCombo().getId() : null;

        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .student(studentResponse)
                .course(courseResponse)
                .progressPercentage(enrollment.getProgressPercentage())
                .completedLessons(enrollment.getCompletedLessons())
                .lastAccessedLessonId(enrollment.getLastAccessedLessonId())
                .finalScore(enrollment.getFinalScore())
                .pricePaid(enrollment.getPricePaid())
                .isCompleted(enrollment.isCompleted())
                .certificateId(enrollment.getCertificateId())
                .certificateUrl(enrollment.getCertificateUrl())
                .expiryDate(enrollment.getExpiryDate())
                .comboId(comboId)
                .voucherCode(enrollment.getVoucherCode())
                .enrolledAt(enrollment.getCreatedAt())
                .completedAt(enrollment.getCompletedAt())
                .build();
    }

    private int countTotalLessons(Course course) {
        int totalLessons = 0;
        for (Module module : course.getModules()) {
            totalLessons += module.getLessons().size();
        }
        return totalLessons;
    }
}