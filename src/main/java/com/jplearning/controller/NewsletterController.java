package com.jplearning.controller;

import com.jplearning.dto.request.NewsletterPreferencesRequest;
import com.jplearning.dto.request.NewsletterSubscriptionRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.NewsletterResponse;
import com.jplearning.dto.response.NewsletterStatusResponse;
import com.jplearning.entity.Newsletter;
import com.jplearning.service.NewsletterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/newsletter")
@Tag(name = "Newsletter", description = "APIs for newsletter subscription management")
@CrossOrigin(origins = "*")
public class NewsletterController {

    @Autowired
    private NewsletterService newsletterService;

    @PostMapping("/subscribe")
    @Operation(
            summary = "Subscribe to newsletter",
            description = "Subscribe an email to the newsletter"
    )
    public ResponseEntity<MessageResponse> subscribe(
            @Valid @RequestBody NewsletterSubscriptionRequest request) {
        return ResponseEntity.ok(newsletterService.subscribe(request));
    }

    @PostMapping("/unsubscribe")
    @Operation(
            summary = "Unsubscribe from newsletter",
            description = "Unsubscribe an email from the newsletter"
    )
    public ResponseEntity<MessageResponse> unsubscribe(@RequestParam String email) {
        return ResponseEntity.ok(newsletterService.unsubscribe(email));
    }

    @GetMapping("/confirm/{token}")
    @Operation(
            summary = "Confirm newsletter subscription",
            description = "Confirm newsletter subscription using verification token"
    )
    public ResponseEntity<MessageResponse> confirmSubscription(@PathVariable String token) {
        return ResponseEntity.ok(newsletterService.confirmSubscription(token));
    }

    @PutMapping("/preferences")
    @Operation(
            summary = "Update newsletter preferences",
            description = "Update newsletter subscription preferences"
    )
    public ResponseEntity<MessageResponse> updatePreferences(
            @Valid @RequestBody NewsletterPreferencesRequest request) {
        return ResponseEntity.ok(newsletterService.updatePreferences(request));
    }

    @GetMapping("/status/{email}")
    @Operation(
            summary = "Get subscription status",
            description = "Get newsletter subscription status for an email"
    )
    public ResponseEntity<NewsletterStatusResponse> getSubscriptionStatus(@PathVariable String email) {
        return ResponseEntity.ok(newsletterService.getSubscriptionStatus(email));
    }

    @GetMapping("/subscribers")
    @Operation(
            summary = "Get all active subscribers",
            description = "Get all active and verified newsletter subscribers (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NewsletterResponse>> getActiveSubscribers() {
        return ResponseEntity.ok(newsletterService.getActiveSubscribers());
    }

    @GetMapping("/subscribers/language/{language}")
    @Operation(
            summary = "Get subscribers by language",
            description = "Get newsletter subscribers by preferred language (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NewsletterResponse>> getSubscribersByLanguage(@PathVariable String language) {
        return ResponseEntity.ok(newsletterService.getSubscribersByLanguage(language));
    }

    @GetMapping("/subscribers/interest/{interest}")
    @Operation(
            summary = "Get subscribers by interest",
            description = "Get newsletter subscribers by interest (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NewsletterResponse>> getSubscribersByInterest(@PathVariable Newsletter.Interest interest) {
        return ResponseEntity.ok(newsletterService.getSubscribersWithInterest(interest));
    }

    @GetMapping("/subscriptions")
    @Operation(
            summary = "Get all subscriptions",
            description = "Get all newsletter subscriptions with pagination (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<NewsletterResponse>> getAllSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(newsletterService.getAllSubscriptions(pageable));
    }

    @GetMapping("/count")
    @Operation(
            summary = "Get subscriber count",
            description = "Get active subscriber count (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getActiveSubscriberCount() {
        return ResponseEntity.ok(newsletterService.getActiveSubscriberCount());
    }
} 