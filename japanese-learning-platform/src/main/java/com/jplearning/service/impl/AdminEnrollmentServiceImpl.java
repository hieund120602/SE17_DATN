package com.jplearning.service.impl;

import com.jplearning.dto.request.ManualEnrollmentRequest;
import com.jplearning.dto.response.CourseResponse;
import com.jplearning.dto.response.EnrollmentResponse;
import com.jplearning.dto.response.StudentBriefResponse;
import com.jplearning.entity.Course;
import com.jplearning.entity.CourseCombo;
import com.jplearning.entity.Enrollment;
import com.jplearning.entity.Student;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.mapper.CourseMapper;
import com.jplearning.repository.CourseComboRepository;
import com.jplearning.repository.CourseRepository;
import com.jplearning.repository.EnrollmentRepository;
import com.jplearning.repository.StudentRepository;
import com.jplearning.service.AdminEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminEnrollmentServiceImpl implements AdminEnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseComboRepository courseComboRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Override
    public Page<EnrollmentResponse> getAllEnrollments(Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentRepository.findAll(pageable);
        return enrollments.map(this::mapToEnrollmentResponse);
    }

    @Override
    public List<EnrollmentResponse> getStudentEnrollments(Long studentId) {
        // Check if student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Get enrollments
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        // Map to response
        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<EnrollmentResponse> getCourseEnrollments(Long courseId, Pageable pageable) {
        // Check if course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Get enrollments
        Page<Enrollment> enrollments = enrollmentRepository.findByCourse(course, pageable);

        // Map to response
        return enrollments.map(this::mapToEnrollmentResponse);
    }

    @Override
    @Transactional
    public EnrollmentResponse createManualEnrollment(ManualEnrollmentRequest request) {
        // Check if student exists
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        // Check if course exists
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        // Check if course is approved
        if (course.getStatus() != Course.Status.APPROVED) {
            throw new BadRequestException("Course is not approved");
        }

        // Check if student is already enrolled in this course
        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByStudentAndCourse(student, course);
        if (existingEnrollment.isPresent()) {
            throw new BadRequestException("Student is already enrolled in this course");
        }

        // Check if combo exists if provided
        CourseCombo combo = null;
        if (request.getComboId() != null) {
            combo = courseComboRepository.findById(request.getComboId())
                    .orElseThrow(() -> new ResourceNotFoundException("Combo not found with id: " + request.getComboId()));
        }

        // Build enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercentage(0)
                .completedLessons(0)
                .pricePaid(request.getPricePaid())
                .isCompleted(false)
                .combo(combo)
                .voucherCode(request.getVoucherCode())
                .expiryDate(request.getExpiryDate())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Save enrollment
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Return response
        return mapToEnrollmentResponse(savedEnrollment);
    }

    @Override
    @Transactional
    public EnrollmentResponse updateEnrollmentStatus(Long enrollmentId, boolean completed) {
        // Check if enrollment exists
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        // Update status
        enrollment.setCompleted(completed);

        // Set completed date if completed
        if (completed) {
            enrollment.setCompletedAt(LocalDateTime.now());

            // If not already 100%, set to 100%
            if (enrollment.getProgressPercentage() < 100) {
                enrollment.setProgressPercentage(100);
            }
        } else {
            enrollment.setCompletedAt(null);
        }

        // Save enrollment
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);

        // Return response
        return mapToEnrollmentResponse(updatedEnrollment);
    }

    // Helper method to map Enrollment to EnrollmentResponse
    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        StudentBriefResponse studentResponse = enrollment.getStudent() != null ? StudentBriefResponse.builder()
                .id(enrollment.getStudent().getId())
                .fullName(enrollment.getStudent().getFullName())
                .email(enrollment.getStudent().getEmail())
                .avatarUrl(enrollment.getStudent().getAvatarUrl())
                .build() : null;

        CourseResponse courseResponse = enrollment.getCourse() != null ?
                courseMapper.courseToResponse(enrollment.getCourse()) : null;

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
}