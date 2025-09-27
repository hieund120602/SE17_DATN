package com.jplearning.service;

import com.jplearning.dto.request.UpdateTutorProfileRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.TutorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminTutorService {
    /**
     * Get all tutors with pagination
     * @param pageable pagination information
     * @return page of tutors
     */
    Page<TutorResponse> getAllTutors(Pageable pageable);

    /**
     * Get pending tutors waiting for approval
     * @param pageable pagination information
     * @return page of pending tutors
     */
    Page<TutorResponse> getPendingTutors(Pageable pageable);

    /**
     * Approve a tutor application
     * @param tutorId ID of the tutor to approve
     * @return success message
     */
    MessageResponse approveTutor(Long tutorId);

    /**
     * Reject a tutor application
     * @param tutorId ID of the tutor to reject
     * @param reason reason for rejection
     * @return success message
     */
    MessageResponse rejectTutor(Long tutorId, String reason);

    /**
     * Update tutor profile information
     * @param tutorId ID of the tutor to update
     * @param request profile update data
     * @return updated tutor information
     */
    TutorResponse updateTutorProfile(Long tutorId, UpdateTutorProfileRequest request);
}
