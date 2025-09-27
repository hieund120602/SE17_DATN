package com.jplearning.service;

public interface CourseCompletionService {
    /**
     * Kiểm tra và xử lý việc hoàn thành khóa học
     * @param enrollmentId ID của enrollment
     * @return true nếu khóa học được hoàn thành, false nếu chưa
     */
    boolean checkAndProcessCourseCompletion(Long enrollmentId);
    
    /**
     * Tạo certificate cho khóa học đã hoàn thành
     * @param enrollmentId ID của enrollment
     * @return URL của certificate đã tạo
     */
    String generateCertificateForCompletedCourse(Long enrollmentId);
    
    /**
     * Kiểm tra xem khóa học có được hoàn thành không
     * @param enrollmentId ID của enrollment
     * @return true nếu đã hoàn thành, false nếu chưa
     */
    boolean isCourseCompleted(Long enrollmentId);
}
