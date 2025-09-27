package com.jplearning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "newsletter_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Newsletter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verification_token_expiry")
    private LocalDateTime verificationTokenExpiry;

    @Column(name = "preferred_language")
    @Builder.Default
    private String preferredLanguage = "vi";

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "newsletter_interests", joinColumns = @JoinColumn(name = "newsletter_id"))
    @Column(name = "interest")
    private Set<Interest> interests;

    @CreationTimestamp
    @Column(name = "subscribed_at", nullable = false, updatable = false)
    private LocalDateTime subscribedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "unsubscribed_at")
    private LocalDateTime unsubscribedAt;

    public enum Interest {
        NEW_COURSES,
        PROMOTIONS,
        LEARNING_TIPS,
        COMMUNITY_UPDATES,
        SYSTEM_UPDATES
    }

    public void verify() {
        this.isVerified = true;
        this.verificationToken = null;
        this.verificationTokenExpiry = null;
    }

    public void unsubscribe() {
        this.isActive = false;
        this.unsubscribedAt = LocalDateTime.now();
    }

    public void resubscribe() {
        this.isActive = true;
        this.unsubscribedAt = null;
    }
} 