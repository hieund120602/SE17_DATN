package com.jplearning.repository;

import com.jplearning.entity.Lesson;
import com.jplearning.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleOrderByPosition(Module module);

    Integer countByModule(Module module);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.module.id = :moduleId")
    Integer countByModuleId(Long moduleId);
}