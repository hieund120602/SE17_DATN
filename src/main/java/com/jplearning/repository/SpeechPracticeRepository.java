package com.jplearning.repository;

import com.jplearning.entity.Lesson;
import com.jplearning.entity.SpeechPractice;
import com.jplearning.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeechPracticeRepository extends JpaRepository<SpeechPractice, Long> {
    Page<SpeechPractice> findByStudent(Student student, Pageable pageable);

    List<SpeechPractice> findByStudentAndLesson(Student student, Lesson lesson);

    List<SpeechPractice> findTop10ByStudentOrderByCreatedAtDesc(Student student);
}