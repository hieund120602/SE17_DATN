package com.jplearning.repository;

import com.jplearning.entity.Lesson;
import com.jplearning.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByLesson(Lesson lesson);
}