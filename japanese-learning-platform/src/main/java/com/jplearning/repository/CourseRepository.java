package com.jplearning.repository;

import com.jplearning.entity.Course;
import com.jplearning.entity.Tutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Page<Course> findByTutor(Tutor tutor, Pageable pageable);

    Page<Course> findByStatus(Course.Status status, Pageable pageable);

    Page<Course> findByTutorAndStatus(Tutor tutor, Course.Status status, Pageable pageable);

    List<Course> findTop5ByOrderByCreatedAtDesc();

    List<Course> findTop10ByStatusOrderByCountBuyDescCreatedAtDesc(Course.Status status);

    Page<Course> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Course> findByTitleContainingIgnoreCaseAndStatus(String title, Course.Status status, Pageable pageable);

    List<Course> findByTitleContainingIgnoreCaseAndStatus(String title, Course.Status status);

    long countByStatus(Course.Status status);

    @Query("SELECT c FROM Course c WHERE c.tutor.id = :tutorId")
    List<Course> findByTutorId(Long tutorId);
}