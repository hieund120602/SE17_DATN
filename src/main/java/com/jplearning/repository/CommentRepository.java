package com.jplearning.repository;

import com.jplearning.entity.Comment;
import com.jplearning.entity.Discussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDiscussion(Discussion discussion);

    List<Comment> findByDiscussionAndParentIsNull(Discussion discussion);

    List<Comment> findByParentId(Long parentId);

    Page<Comment> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT c FROM Comment c WHERE c.discussion.id = :discussionId AND c.parent IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findTopLevelCommentsByDiscussionId(Long discussionId);
}