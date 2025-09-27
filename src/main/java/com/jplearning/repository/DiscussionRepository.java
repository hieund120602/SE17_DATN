package com.jplearning.repository;

import com.jplearning.entity.Discussion;
import com.jplearning.entity.Lesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Long> {
    List<Discussion> findByLesson(Lesson lesson);

    Page<Discussion> findByLesson(Lesson lesson, Pageable pageable);

    Page<Discussion> findByLessonId(Long lessonId, Pageable pageable);

    Page<Discussion> findByUserId(Long userId, Pageable pageable);
}