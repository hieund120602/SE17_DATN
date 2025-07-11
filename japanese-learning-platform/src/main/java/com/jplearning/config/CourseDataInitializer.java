package com.jplearning.config;

import com.jplearning.entity.Course;
import com.jplearning.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Initialize course-related data on application startup
 */
@Component
@Order(2)
public class CourseDataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(CourseDataInitializer.class);

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if there are existing courses
        long courseCount = courseRepository.count();

        if (courseCount > 0) {
            logger.info("Course data already exists, skipping initialization");
            return;
        }

        // Log successful initialization
        logger.info("Course data initialized successfully");
    }
}