package com.jplearning.service.impl;

import com.jplearning.dto.response.DashboardStatisticsResponse;
import com.jplearning.dto.response.MonthlyRevenueData;
import com.jplearning.dto.response.PaymentHistoryResponse;
import com.jplearning.dto.response.PaymentStatisticsResponse;
import com.jplearning.entity.Course;
import com.jplearning.entity.Enrollment;
import com.jplearning.entity.Payment;
import com.jplearning.repository.*;
import com.jplearning.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseComboRepository courseComboRepository;

    @Override
    public PaymentStatisticsResponse getPaymentStatistics(LocalDate startDate, LocalDate endDate) {
        // Convert LocalDate to LocalDateTime for query
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Get all completed payments in the date range
        List<Payment> payments = paymentRepository.findByStatusAndPaidAtBetween(
                Payment.PaymentStatus.COMPLETED,
                startDateTime,
                endDateTime);

        // Calculate total revenue
        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate average payment amount
        BigDecimal averageAmount = BigDecimal.ZERO;
        if (!payments.isEmpty()) {
            averageAmount = totalRevenue.divide(BigDecimal.valueOf(payments.size()), 2, RoundingMode.HALF_UP);
        }

        // Calculate monthly revenue
        Map<String, MonthlyRevenueData> monthlyDataMap = new HashMap<>();
        for (Payment payment : payments) {
            LocalDateTime paidAt = payment.getPaidAt();
            String key = paidAt.getYear() + "-" + paidAt.getMonthValue();

            monthlyDataMap.computeIfAbsent(key, k -> {
                String[] parts = k.split("-");
                return MonthlyRevenueData.builder()
                        .year(Integer.parseInt(parts[0]))
                        .month(Integer.parseInt(parts[1]))
                        .amount(BigDecimal.ZERO)
                        .transactionCount(0)
                        .build();
            });

            MonthlyRevenueData data = monthlyDataMap.get(key);
            data.setAmount(data.getAmount().add(payment.getAmount()));
            data.setTransactionCount(data.getTransactionCount() + 1);
        }

        List<MonthlyRevenueData> monthlyRevenue = new ArrayList<>(monthlyDataMap.values());
        monthlyRevenue.sort(Comparator.comparing(MonthlyRevenueData::getYear)
                .thenComparing(MonthlyRevenueData::getMonth));

        // Calculate payment status distribution
        Map<String, Long> statusDistribution = paymentRepository.findByPaidAtBetween(startDateTime, endDateTime).stream()
                .collect(Collectors.groupingBy(
                        payment -> payment.getStatus().name(),
                        Collectors.counting()
                ));

        // Calculate revenue by course
        Map<String, BigDecimal> courseRevenue = new HashMap<>();
        for (Payment payment : payments) {
            // Find enrollments associated with this payment
            List<Enrollment> enrollments = enrollmentRepository.findByPayment(payment);

            for (Enrollment enrollment : enrollments) {
                String courseName = enrollment.getCourse().getTitle();
                BigDecimal amount = enrollment.getPricePaid();

                courseRevenue.compute(courseName, (k, v) -> (v == null) ? amount : v.add(amount));
            }
        }

        // Build and return response
        return PaymentStatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(payments.size())
                .averagePaymentAmount(averageAmount)
                .monthlyRevenue(monthlyRevenue)
                .paymentStatusDistribution(statusDistribution)
                .courseRevenue(courseRevenue)
                .build();
    }

    @Override
    public List<PaymentHistoryResponse> getStudentPaymentHistory(Long studentId) {
        // Get all payments for the student
        List<Payment> payments = paymentRepository.findByStudentId(studentId);

        return mapPaymentsToHistory(payments);
    }

    @Override
    public List<PaymentHistoryResponse> getAllPaymentHistory(LocalDate startDate, LocalDate endDate) {
        // Convert LocalDate to LocalDateTime for query
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Get all payments in the date range
        List<Payment> payments = paymentRepository.findByPaidAtBetween(startDateTime, endDateTime);

        return mapPaymentsToHistory(payments);
    }

    @Override
    public List<PaymentHistoryResponse> getCoursePaymentHistory(Long courseId) {
        // Get all enrollments for the course
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        // Extract payment IDs
        Set<Long> paymentIds = enrollments.stream()
                .filter(e -> e.getPayment() != null)
                .map(e -> e.getPayment().getId())
                .collect(Collectors.toSet());

        // Get payments by IDs
        List<Payment> payments = paymentRepository.findAllById(paymentIds);

        return mapPaymentsToHistory(payments);
    }

    @Override
    public List<PaymentHistoryResponse> getTutorPaymentHistory(Long tutorId) {
        // Get all courses by the tutor
        List<Course> tutorCourses = courseRepository.findByTutorId(tutorId);

        // Get all enrollments for these courses
        List<Enrollment> enrollments = new ArrayList<>();
        for (Course course : tutorCourses) {
            enrollments.addAll(enrollmentRepository.findByCourseId(course.getId()));
        }

        // Extract payment IDs
        Set<Long> paymentIds = enrollments.stream()
                .filter(e -> e.getPayment() != null)
                .map(e -> e.getPayment().getId())
                .collect(Collectors.toSet());

        // Get payments by IDs
        List<Payment> payments = paymentRepository.findAllById(paymentIds);

        return mapPaymentsToHistory(payments);
    }

    @Override
    public DashboardStatisticsResponse getDashboardStatistics() {
        // Get counts
        long totalStudents = studentRepository.count();
        long totalTutors = tutorRepository.count();
        long totalCourses = courseRepository.count();
        long pendingTutorApprovals = tutorRepository.countByEnabled(false);
        long pendingCourseApprovals = courseRepository.countByStatus(Course.Status.PENDING_APPROVAL);

        // Get total revenue from completed payments
        List<Payment> completedPayments = paymentRepository.findByStatus(Payment.PaymentStatus.COMPLETED);
        BigDecimal totalRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Get total enrollments
        long totalEnrollments = enrollmentRepository.count();

        // Get recent revenue (last 6 months)
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Payment> recentPayments = paymentRepository.findByStatusAndPaidAtAfter(
                Payment.PaymentStatus.COMPLETED, sixMonthsAgo);

        Map<String, MonthlyRevenueData> monthlyDataMap = new HashMap<>();
        for (Payment payment : recentPayments) {
            LocalDateTime paidAt = payment.getPaidAt();
            String key = paidAt.getYear() + "-" + paidAt.getMonthValue();

            monthlyDataMap.computeIfAbsent(key, k -> {
                String[] parts = k.split("-");
                return MonthlyRevenueData.builder()
                        .year(Integer.parseInt(parts[0]))
                        .month(Integer.parseInt(parts[1]))
                        .amount(BigDecimal.ZERO)
                        .transactionCount(0)
                        .build();
            });

            MonthlyRevenueData data = monthlyDataMap.get(key);
            data.setAmount(data.getAmount().add(payment.getAmount()));
            data.setTransactionCount(data.getTransactionCount() + 1);
        }

        List<MonthlyRevenueData> recentRevenue = new ArrayList<>(monthlyDataMap.values());
        recentRevenue.sort(Comparator.comparing(MonthlyRevenueData::getYear)
                .thenComparing(MonthlyRevenueData::getMonth));

        // Get enrollments by course level
        Map<String, Long> enrollmentsByLevel = new HashMap<>();
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();

        for (Enrollment enrollment : allEnrollments) {
            String levelName  = enrollment.getCourse().getLevel().getName();
            enrollmentsByLevel.compute(levelName, (k, v) -> (v == null) ? 1L : v + 1);
        }

        // Build and return response
        return DashboardStatisticsResponse.builder()
                .totalStudents(totalStudents)
                .totalTutors(totalTutors)
                .totalCourses(totalCourses)
                .pendingTutorApprovals(pendingTutorApprovals)
                .pendingCourseApprovals(pendingCourseApprovals)
                .totalRevenue(totalRevenue)
                .totalEnrollments(totalEnrollments)
                .recentRevenue(recentRevenue)
                .enrollmentsByLevel(enrollmentsByLevel)
                .build();
    }

    // Helper method to map Payment entities to PaymentHistoryResponse DTOs
    private List<PaymentHistoryResponse> mapPaymentsToHistory(List<Payment> payments) {
        List<PaymentHistoryResponse> result = new ArrayList<>();

        for (Payment payment : payments) {
            // Find enrollments associated with this payment
            List<Enrollment> enrollments = enrollmentRepository.findByPayment(payment);

            if (enrollments.isEmpty()) {
                // Payment without enrollments (rare case)
                result.add(mapPaymentToHistoryWithoutEnrollment(payment));
            } else {
                // Map each enrollment to a separate payment history entry
                for (Enrollment enrollment : enrollments) {
                    result.add(mapPaymentToHistory(payment, enrollment));
                }
            }
        }

        return result;
    }

    private PaymentHistoryResponse mapPaymentToHistory(Payment payment, Enrollment enrollment) {
        return PaymentHistoryResponse.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderInfo(payment.getOrderInfo())
                .amount(enrollment.getPricePaid()) // Use the enrollment price (could be different for combos)
                .status(payment.getStatus().name())
                .paymentMethod(payment.getMethod().name())
                .courseName(enrollment.getCourse().getTitle())
                .courseId(enrollment.getCourse().getId())
                .comboName(enrollment.getCombo() != null ? enrollment.getCombo().getTitle() : null)
                .comboId(enrollment.getCombo() != null ? enrollment.getCombo().getId() : null)
                .paymentDate(payment.getPaidAt() != null ? payment.getPaidAt().toLocalDate() : null)
                .studentName(payment.getStudent().getFullName())
                .studentId(payment.getStudent().getId())
                .build();
    }

    private PaymentHistoryResponse mapPaymentToHistoryWithoutEnrollment(Payment payment) {
        return PaymentHistoryResponse.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderInfo(payment.getOrderInfo())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .paymentMethod(payment.getMethod().name())
                .paymentDate(payment.getPaidAt() != null ? payment.getPaidAt().toLocalDate() : null)
                .studentName(payment.getStudent().getFullName())
                .studentId(payment.getStudent().getId())
                .build();
    }
}