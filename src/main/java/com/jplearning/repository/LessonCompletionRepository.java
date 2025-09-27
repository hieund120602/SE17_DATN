package com.jplearning.repository;

import com.jplearning.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, Long> {

    @Query("SELECT lc FROM LessonCompletion lc WHERE lc.student.id = :studentId AND lc.course.id = :courseId")
    List<LessonCompletion> findByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("SELECT lc FROM LessonCompletion lc WHERE lc.lesson.id = :lessonId AND lc.student.id = :studentId")
    Optional<LessonCompletion> findByLessonIdAndStudentId(Long lessonId, Long studentId);

    @Query("SELECT COUNT(lc) FROM LessonCompletion lc WHERE lc.student.id = :studentId AND lc.course.id = :courseId")
    Long countByStudentIdAndCourseId(Long studentId, Long courseId);

    int countByLessonId(Long lessonId);
}