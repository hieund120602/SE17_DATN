package com.jplearning.service;

import com.jplearning.dto.request.CommentRequest;
import com.jplearning.dto.request.DiscussionRequest;
import com.jplearning.dto.response.CommentResponse;
import com.jplearning.dto.response.DiscussionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DiscussionService {
    /**
     * Create a new discussion
     * @param userId ID of the user creating the discussion
     * @param request Discussion details
     * @return Created discussion response
     */
    DiscussionResponse createDiscussion(Long userId, DiscussionRequest request);

    /**
     * Get a discussion by ID
     * @param discussionId ID of the discussion
     * @return Discussion response
     */
    DiscussionResponse getDiscussionById(Long discussionId);

    /**
     * Update a discussion
     * @param discussionId ID of the discussion to update
     * @param userId ID of the user updating the discussion
     * @param request Updated discussion details
     * @return Updated discussion response
     */
    DiscussionResponse updateDiscussion(Long discussionId, Long userId, DiscussionRequest request);

    /**
     * Delete a discussion
     * @param discussionId ID of the discussion to delete
     * @param userId ID of the user deleting the discussion
     */
    void deleteDiscussion(Long discussionId, Long userId);

    /**
     * Get all discussions for a lesson
     * @param lessonId ID of the lesson
     * @param pageable Pagination information
     * @return Page of discussion responses
     */
    Page<DiscussionResponse> getDiscussionsByLesson(Long lessonId, Pageable pageable);

    /**
     * Get all discussions created by a user
     * @param userId ID of the user
     * @param pageable Pagination information
     * @return Page of discussion responses
     */
    Page<DiscussionResponse> getDiscussionsByUser(Long userId, Pageable pageable);

    /**
     * Add a comment to a discussion
     * @param discussionId ID of the discussion
     * @param userId ID of the user adding the comment
     * @param request Comment details
     * @return Created comment response
     */
    CommentResponse addComment(Long discussionId, Long userId, CommentRequest request);

    /**
     * Get a comment by ID
     * @param commentId ID of the comment
     * @return Comment response
     */
    CommentResponse getCommentById(Long commentId);

    /**
     * Update a comment
     * @param commentId ID of the comment to update
     * @param userId ID of the user updating the comment
     * @param request Updated comment details
     * @return Updated comment response
     */
    CommentResponse updateComment(Long commentId, Long userId, CommentRequest request);

    /**
     * Delete a comment
     * @param commentId ID of the comment to delete
     * @param userId ID of the user deleting the comment
     */
    void deleteComment(Long commentId, Long userId);

    /**
     * Get all comments for a discussion
     * @param discussionId ID of the discussion
     * @return List of comment responses
     */
    List<CommentResponse> getCommentsByDiscussion(Long discussionId);

    /**
     * Get all replies to a comment
     * @param commentId ID of the parent comment
     * @return List of comment responses (replies)
     */
    List<CommentResponse> getRepliesByComment(Long commentId);
}
