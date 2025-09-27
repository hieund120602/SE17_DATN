package com.jplearning.repository;

import com.jplearning.entity.Exercise;
import com.jplearning.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByLesson(Lesson lesson);
}