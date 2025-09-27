package com.jplearning.repository;

import com.jplearning.entity.Newsletter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NewsletterRepository extends JpaRepository<Newsletter, Long> {

    /**
     * Find newsletter subscription by email
     */
    Optional<Newsletter> findByEmail(String email);

    /**
     * Find newsletter subscription by verification token
     */
    Optional<Newsletter> findByVerificationToken(String token);

    /**
     * Check if email exists in newsletter subscriptions
     */
    boolean existsByEmail(String email);

    /**
     * Find all active subscribers
     */
    List<Newsletter> findByIsActiveTrueAndIsVerifiedTrue();

    /**
     * Find active subscribers by preferred language
     */
    List<Newsletter> findByIsActiveTrueAndIsVerifiedTrueAndPreferredLanguage(String language);

    /**
     * Find active subscribers with specific interest
     */
    @Query("SELECT n FROM Newsletter n WHERE n.isActive = true AND n.isVerified = true AND :interest MEMBER OF n.interests")
    List<Newsletter> findActiveSubscribersWithInterest(@Param("interest") Newsletter.Interest interest);

    /**
     * Find subscriptions with expired verification tokens
     */
    @Query("SELECT n FROM Newsletter n WHERE n.isVerified = false AND n.verificationTokenExpiry < :now")
    List<Newsletter> findExpiredUnverifiedSubscriptions(@Param("now") LocalDateTime now);

    /**
     * Get subscription statistics
     */
    @Query("SELECT COUNT(n) FROM Newsletter n WHERE n.isActive = true AND n.isVerified = true")
    Long countActiveSubscribers();

    /**
     * Count subscriptions by language
     */
    @Query("SELECT n.preferredLanguage, COUNT(n) FROM Newsletter n WHERE n.isActive = true AND n.isVerified = true GROUP BY n.preferredLanguage")
    List<Object[]> countSubscribersByLanguage();

    /**
     * Find all subscriptions for admin management
     */
    Page<Newsletter> findAllByOrderBySubscribedAtDesc(Pageable pageable);
} 