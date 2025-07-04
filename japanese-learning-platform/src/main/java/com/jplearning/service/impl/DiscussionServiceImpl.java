package com.jplearning.service.impl;

import com.jplearning.dto.request.CommentRequest;
import com.jplearning.dto.request.DiscussionRequest;
import com.jplearning.dto.response.CommentResponse;
import com.jplearning.dto.response.DiscussionResponse;
import com.jplearning.dto.response.UserBriefResponse;
import com.jplearning.entity.*;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.*;
import com.jplearning.service.DiscussionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DiscussionServiceImpl implements DiscussionService {

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Override
    @Transactional
    public DiscussionResponse createDiscussion(Long userId, DiscussionRequest request) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Find lesson
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

        // Create discussion
        Discussion discussion = Discussion.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .user(user)
                .lesson(lesson)
                .comments(new ArrayList<>())
                .build();

        Discussion savedDiscussion = discussionRepository.save(discussion);

        return mapToDiscussionResponse(savedDiscussion);
    }

    @Override
    public DiscussionResponse getDiscussionById(Long discussionId) {
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResourceNotFoundException("Discussion not found with id: " + discussionId));

        return mapToDiscussionResponse(discussion);
    }

    @Override
    @Transactional
    public DiscussionResponse updateDiscussion(Long discussionId, Long userId, DiscussionRequest request) {
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResourceNotFoundException("Discussion not found with id: " + discussionId));

        // Verify the user is the owner or an admin
        if (!discussion.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new AccessDeniedException("You don't have permission to update this discussion");
        }

        // If lesson ID is being changed, verify the lesson exists
        if (!discussion.getLesson().getId().equals(request.getLessonId())) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));
            discussion.setLesson(lesson);
        }

        // Update discussion
        discussion.setTitle(request.getTitle());
        discussion.setContent(request.getContent());

        Discussion updatedDiscussion = discussionRepository.save(discussion);

        return mapToDiscussionResponse(updatedDiscussion);
    }

    @Override
    @Transactional
    public void deleteDiscussion(Long discussionId, Long userId) {
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResourceNotFoundException("Discussion not found with id: " + discussionId));

        // Verify the user is the owner or an admin
        if (!discussion.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this discussion");
        }

        // Delete discussion (will cascade delete all comments)
        discussionRepository.delete(discussion);
    }

    @Override
    public Page<DiscussionResponse> getDiscussionsByLesson(Long lessonId, Pageable pageable) {
        Page<Discussion> discussions = discussionRepository.findByLessonId(lessonId, pageable);
        return discussions.map(this::mapToDiscussionResponse);
    }

    @Override
    public Page<DiscussionResponse> getDiscussionsByUser(Long userId, Pageable pageable) {
        Page<Discussion> discussions = discussionRepository.findByUserId(userId, pageable);
        return discussions.map(this::mapToDiscussionResponse);
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long discussionId, Long userId, CommentRequest request) {
        // Find discussion
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new ResourceNotFoundException("Discussion not found with id: " + discussionId));

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if this is a reply to another comment
        Comment parentComment = null;
        if (request.getParentId() != null) {
            parentComment = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found with id: " + request.getParentId()));

            // Verify parent comment belongs to the same discussion
            if (!parentComment.getDiscussion().getId().equals(discussionId)) {
                throw new BadRequestException("Parent comment does not belong to the specified discussion");
            }
        }

        // Create comment
        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .discussion(discussion)
                .parent(parentComment)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return mapToCommentResponse(savedComment);
    }

    @Override
    public CommentResponse getCommentById(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        return mapToCommentResponse(comment);
    }

    @Override
    @Transactional
    public CommentResponse updateComment(Long commentId, Long userId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Verify the user is the owner or an admin
        if (!comment.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new AccessDeniedException("You don't have permission to update this comment");
        }

        // Update comment
        comment.setContent(request.getContent());

        Comment updatedComment = commentRepository.save(comment);

        return mapToCommentResponse(updatedComment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Verify the user is the owner or an admin
        if (!comment.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this comment");
        }

        // Delete comment
        commentRepository.delete(comment);
    }

    @Override
    public List<CommentResponse> getCommentsByDiscussion(Long discussionId) {
        List<Comment> topLevelComments = commentRepository.findTopLevelCommentsByDiscussionId(discussionId);
        return topLevelComments.stream()
                .map(this::mapToCommentResponseWithReplies)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommentResponse> getRepliesByComment(Long commentId) {
        List<Comment> replies = commentRepository.findByParentId(commentId);
        return replies.stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    // Helper methods

    private boolean isAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.ERole.ROLE_ADMIN);
    }

    private DiscussionResponse mapToDiscussionResponse(Discussion discussion) {
        UserBriefResponse userResponse = mapToUserBriefResponse(discussion.getUser());

        // Get top-level comments only, with their replies nested
        List<Comment> topLevelComments = discussion.getComments().stream()
                .filter(comment -> comment.getParent() == null)
                .collect(Collectors.toList());

        List<CommentResponse> commentResponses = topLevelComments.stream()
                .map(this::mapToCommentResponseWithReplies)
                .collect(Collectors.toList());

        return DiscussionResponse.builder()
                .id(discussion.getId())
                .title(discussion.getTitle())
                .content(discussion.getContent())
                .user(userResponse)
                .lessonId(discussion.getLesson().getId())
                .comments(commentResponses)
                .createdAt(discussion.getCreatedAt())
                .updatedAt(discussion.getUpdatedAt())
                .build();
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        UserBriefResponse userResponse = mapToUserBriefResponse(comment.getUser());

        Long parentId = comment.getParent() != null ? comment.getParent().getId() : null;

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(userResponse)
                .discussionId(comment.getDiscussion().getId())
                .parentId(parentId)
                .replies(new ArrayList<>()) // Empty list, no recursion
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private CommentResponse mapToCommentResponseWithReplies(Comment comment) {
        CommentResponse response = mapToCommentResponse(comment);

        // Get replies for this comment
        List<Comment> replies = commentRepository.findByParentId(comment.getId());
        if (!replies.isEmpty()) {
            List<CommentResponse> replyResponses = replies.stream()
                    .map(this::mapToCommentResponse) // No further recursion to avoid potential issues
                    .collect(Collectors.toList());
            response.setReplies(replyResponses);
        }

        return response;
    }

    private UserBriefResponse mapToUserBriefResponse(User user) {
        String userType = "UNKNOWN";

        // Determine user type
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        if (roleNames.contains(Role.ERole.ROLE_ADMIN.name())) {
            userType = "ADMIN";
        } else if (roleNames.contains(Role.ERole.ROLE_TUTOR.name())) {
            userType = "TUTOR";
        } else if (roleNames.contains(Role.ERole.ROLE_STUDENT.name())) {
            userType = "STUDENT";
        }

        return UserBriefResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .userType(userType)
                .build();
    }
}