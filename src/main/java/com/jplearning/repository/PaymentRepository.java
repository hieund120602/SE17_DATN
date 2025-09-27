package com.jplearning.repository;

import com.jplearning.entity.Payment;
import com.jplearning.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByStudentAndStatus(Student student, Payment.PaymentStatus status);

    Page<Payment> findByStudent(Student student, Pageable pageable);

    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);

    List<Payment> findByStatus(Payment.PaymentStatus status);

    List<Payment> findByPaidAtBetween(LocalDateTime start, LocalDateTime end);

    List<Payment> findByStatusAndPaidAtBetween(Payment.PaymentStatus status, LocalDateTime start, LocalDateTime end);

    List<Payment> findByStatusAndPaidAtAfter(Payment.PaymentStatus status, LocalDateTime after);

    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId")
    List<Payment> findByStudentId(Long studentId);
}