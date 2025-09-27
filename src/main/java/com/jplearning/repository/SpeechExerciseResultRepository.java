package com.jplearning.repository;

import com.jplearning.entity.Exercise;
import com.jplearning.entity.SpeechExerciseResult;
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
public interface SpeechExerciseResultRepository extends JpaRepository<SpeechExerciseResult, Long> {

    List<SpeechExerciseResult> findByStudentAndExercise(Student student, Exercise exercise);

    Page<SpeechExerciseResult> findByStudent(Student student, Pageable pageable);

    @Query("SELECT COUNT(ser) FROM SpeechExerciseResult ser WHERE ser.student.id = :studentId AND ser.isPassed = true")
    Long countPassedExercisesByStudent(Long studentId);

    @Query("SELECT AVG(ser.accuracyScore) FROM SpeechExerciseResult ser WHERE ser.student.id = :studentId")
    Double getAverageAccuracyScoreByStudent(Long studentId);

    @Query("SELECT ser FROM SpeechExerciseResult ser WHERE ser.student.id = :studentId AND ser.exercise.id = :exerciseId ORDER BY ser.createdAt DESC")
    Page<SpeechExerciseResult> findLatestAttemptsByStudentAndExercise(Long studentId, Long exerciseId, Pageable pageable);

    List<SpeechExerciseResult> findByStudentAndCreatedAtBetween(Student student, LocalDateTime start, LocalDateTime end);

    @Query("SELECT ser FROM SpeechExerciseResult ser WHERE ser.student.id = :studentId ORDER BY ser.createdAt DESC")
    Page<SpeechExerciseResult> findRecentResultsByStudent(Long studentId, Pageable pageable);
}
