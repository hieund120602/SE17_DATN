package com.jplearning.repository;

import com.jplearning.entity.Course;
import com.jplearning.entity.Enrollment;
import com.jplearning.entity.Payment;
import com.jplearning.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByStudentAndCourse(Student student, Course course);

    List<Enrollment> findByStudent(Student student);

    Page<Enrollment> findByStudent(Student student, Pageable pageable);

    Page<Enrollment> findByCourse(Course course, Pageable pageable);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.course.id = :courseId")
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId")
    List<Enrollment> findByStudentId(Long studentId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.combo.id = :comboId")
    List<Enrollment> findByStudentIdAndComboId(Long studentId, Long comboId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId")
    Long countByCourseId(Long courseId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.combo.id = :comboId")
    Long countByComboId(Long comboId);

    @Query("SELECT e FROM Enrollment e WHERE e.course.id = :courseId")
    List<Enrollment> findByCourseId(Long courseId);

    List<Enrollment> findByPayment(Payment payment);
}