package com.jplearning.repository;

import com.jplearning.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Page<Student> findByEnabled(boolean enabled, Pageable pageable);

    Page<Student> findByBlocked(boolean blocked, Pageable pageable);

    Page<Student> findByEnabledAndBlocked(boolean enabled, boolean blocked, Pageable pageable);
}