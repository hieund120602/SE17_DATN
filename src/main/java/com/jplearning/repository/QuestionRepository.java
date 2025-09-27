package com.jplearning.repository;

import com.jplearning.entity.Exercise;
import com.jplearning.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExercise(Exercise exercise);
}