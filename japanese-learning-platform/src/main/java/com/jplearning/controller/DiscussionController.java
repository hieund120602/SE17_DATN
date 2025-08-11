package com.jplearning.controller;

import com.jplearning.dto.request.CommentRequest;
import com.jplearning.dto.request.DiscussionRequest;
import com.jplearning.dto.response.CommentResponse;
import com.jplearning.dto.response.DiscussionResponse;
import com.jplearning.security.services.UserDetailsImpl;
import com.jplearning.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discussions")
@Tag(name = "Discussion", description = "Discussion and comment APIs")
@CrossOrigin(origins = "*")
public class DiscussionController {

    @Autowired
    private DiscussionService discussionService;

    @PostMapping
    @Operation(
            summary = "Create discussion",
            description = "Create a new discussion for a lesson",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<DiscussionResponse> createDiscussion(@Valid @RequestBody DiscussionRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(discussionService.createDiscussion(userId, request));
    }

    @GetMapping("/{discussionId}")
    @Operation(
            summary = "Get discussion",
            description = "Get details of a specific discussion with its comments",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<DiscussionResponse> getDiscussionById(@PathVariable Long discussionId) {
        return ResponseEntity.ok(discussionService.getDiscussionById(discussionId));
    }

    @PutMapping("/{discussionId}")
    @Operation(
            summary = "Update discussion",
            description = "Update an existing discussion",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<DiscussionResponse> updateDiscussion(
            @PathVariable Long discussionId,
            @Valid @RequestBody DiscussionRequest request) {

        Long userId = getCurrentUserId();
        return ResponseEntity.ok(discussionService.updateDiscussion(discussionId, userId, request));
    }

    @DeleteMapping("/{discussionId}")
    @Operation(
            summary = "Delete discussion",
            description = "Delete an existing discussion",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDiscussion(@PathVariable Long discussionId) {
        Long userId = getCurrentUserId();
        discussionService.deleteDiscussion(discussionId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/lesson/{lessonId}")
    @Operation(
            summary = "Get discussions by lesson",
            description = "Get all discussions for a specific lesson",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<DiscussionResponse>> getDiscussionsByLesson(
            @PathVariable Long lessonId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(discussionService.getDiscussionsByLesson(lessonId, pageable));
    }

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "Get discussions by user",
            description = "Get all discussions created by a specific user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DiscussionResponse>> getDiscussionsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(discussionService.getDiscussionsByUser(userId, pageable));
    }

    @GetMapping("/my-discussions")
    @Operation(
            summary = "Get my discussions",
            description = "Get all discussions created by the current user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR')")
    public ResponseEntity<Page<DiscussionResponse>> getMyDiscussions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(discussionService.getDiscussionsByUser(userId, pageable));
    }

    @PostMapping("/{discussionId}/comments")
    @Operation(
            summary = "Add comment",
            description = "Add a comment to a discussion or reply to another comment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long discussionId,
            @Valid @RequestBody CommentRequest request) {

        Long userId = getCurrentUserId();
        return ResponseEntity.ok(discussionService.addComment(discussionId, userId, request));
    }

    @GetMapping("/{discussionId}/comments")
    @Operation(
            summary = "Get comments",
            description = "Get all top-level comments for a discussion",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<CommentResponse>> getCommentsByDiscussion(@PathVariable Long discussionId) {
        return ResponseEntity.ok(discussionService.getCommentsByDiscussion(discussionId));
    }

    @GetMapping("/comments/{commentId}")
    @Operation(
            summary = "Get comment",
            description = "Get details of a specific comment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable Long commentId) {
        return ResponseEntity.ok(discussionService.getCommentById(commentId));
    }

    @PutMapping("/comments/{commentId}")
    @Operation(
            summary = "Update comment",
            description = "Update an existing comment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {

        Long userId = getCurrentUserId();
        return ResponseEntity.ok(discussionService.updateComment(commentId, userId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(
            summary = "Delete comment",
            description = "Delete an existing comment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        Long userId = getCurrentUserId();
        discussionService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/comments/{commentId}/replies")
    @Operation(
            summary = "Get replies",
            description = "Get all replies to a specific comment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<CommentResponse>> getRepliesByComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(discussionService.getRepliesByComment(commentId));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}