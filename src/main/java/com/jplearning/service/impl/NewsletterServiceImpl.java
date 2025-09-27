package com.jplearning.service.impl;

import com.jplearning.dto.request.NewsletterPreferencesRequest;
import com.jplearning.dto.request.NewsletterSubscriptionRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.NewsletterResponse;
import com.jplearning.dto.response.NewsletterStatusResponse;
import com.jplearning.entity.Newsletter;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.NewsletterRepository;
import com.jplearning.service.EmailService;
import com.jplearning.service.NewsletterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NewsletterServiceImpl implements NewsletterService {

    @Autowired
    private NewsletterRepository newsletterRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    @Transactional
    public MessageResponse subscribe(NewsletterSubscriptionRequest request) {
        // Check if email already exists
        Optional<Newsletter> existingSubscription = newsletterRepository.findByEmail(request.getEmail());
        
        if (existingSubscription.isPresent()) {
            Newsletter newsletter = existingSubscription.get();
            if (newsletter.getIsActive() && newsletter.getIsVerified()) {
                return new MessageResponse("Email đã được đăng ký newsletter");
            } else if (newsletter.getIsActive() && !newsletter.getIsVerified()) {
                // Resend verification email
                sendVerificationEmail(newsletter.getEmail(), newsletter.getVerificationToken());
                return new MessageResponse("Email xác thực đã được gửi lại");
            } else {
                // Reactivate subscription
                newsletter.resubscribe();
                newsletter.setFullName(request.getFullName());
                newsletter.setPreferredLanguage(request.getPreferredLanguage());
                newsletter.setInterests(request.getInterests());
                
                // Generate new verification token
                String token = UUID.randomUUID().toString();
                newsletter.setVerificationToken(token);
                newsletter.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
                
                newsletterRepository.save(newsletter);
                sendVerificationEmail(newsletter.getEmail(), token);
                return new MessageResponse("Đăng ký lại newsletter thành công. Vui lòng kiểm tra email để xác thực");
            }
        }

        // Create new subscription
        String token = UUID.randomUUID().toString();
        Newsletter newsletter = Newsletter.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "vi")
                .interests(request.getInterests())
                .verificationToken(token)
                .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        newsletterRepository.save(newsletter);
        sendVerificationEmail(request.getEmail(), token);
        
        log.info("New newsletter subscription created for email: {}", request.getEmail());
        return new MessageResponse("Đăng ký newsletter thành công. Vui lòng kiểm tra email để xác thực");
    }

    @Override
    @Transactional
    public MessageResponse unsubscribe(String email) {
        Newsletter newsletter = newsletterRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại trong danh sách đăng ký"));

        if (!newsletter.getIsActive()) {
            return new MessageResponse("Email đã được hủy đăng ký trước đó");
        }

        newsletter.unsubscribe();
        newsletterRepository.save(newsletter);

        log.info("Newsletter unsubscribed for email: {}", email);
        return new MessageResponse("Hủy đăng ký newsletter thành công");
    }

    @Override
    @Transactional
    public MessageResponse confirmSubscription(String token) {
        Newsletter newsletter = newsletterRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token xác thực không hợp lệ"));

        if (newsletter.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token xác thực đã hết hạn");
        }

        if (newsletter.getIsVerified()) {
            return new MessageResponse("Email đã được xác thực trước đó");
        }

        newsletter.verify();
        newsletterRepository.save(newsletter);

        log.info("Newsletter subscription verified for email: {}", newsletter.getEmail());
        return new MessageResponse("Xác thực email thành công. Bạn sẽ nhận được bản tin định kỳ");
    }

    @Override
    @Transactional
    public MessageResponse updatePreferences(NewsletterPreferencesRequest request) {
        Newsletter newsletter = newsletterRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại trong danh sách đăng ký"));

        if (!newsletter.getIsActive() || !newsletter.getIsVerified()) {
            throw new BadRequestException("Email chưa được kích hoạt hoặc xác thực");
        }

        // Update preferences
        if (request.getFullName() != null) {
            newsletter.setFullName(request.getFullName());
        }
        if (request.getPreferredLanguage() != null) {
            newsletter.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getInterests() != null) {
            newsletter.setInterests(request.getInterests());
        }

        newsletterRepository.save(newsletter);
        return new MessageResponse("Cập nhật thông tin newsletter thành công");
    }

    @Override
    public NewsletterStatusResponse getSubscriptionStatus(String email) {
        Optional<Newsletter> newsletter = newsletterRepository.findByEmail(email);
        
        if (newsletter.isEmpty()) {
            return NewsletterStatusResponse.builder()
                    .isSubscribed(false)
                    .isVerified(false)
                    .status("NOT_SUBSCRIBED")
                    .message("Email chưa đăng ký newsletter")
                    .build();
        }

        Newsletter sub = newsletter.get();
        String status;
        String message;

        if (sub.getIsActive() && sub.getIsVerified()) {
            status = "SUBSCRIBED";
            message = "Email đã đăng ký và xác thực newsletter";
        } else if (sub.getIsActive() && !sub.getIsVerified()) {
            status = "PENDING_VERIFICATION";
            message = "Email đã đăng ký nhưng chưa xác thực";
        } else {
            status = "UNSUBSCRIBED";
            message = "Email đã hủy đăng ký newsletter";
        }

        return NewsletterStatusResponse.builder()
                .isSubscribed(sub.getIsActive())
                .isVerified(sub.getIsVerified())
                .status(status)
                .message(message)
                .build();
    }

    @Override
    public List<NewsletterResponse> getActiveSubscribers() {
        List<Newsletter> newsletters = newsletterRepository.findByIsActiveTrueAndIsVerifiedTrue();
        return newsletters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NewsletterResponse> getSubscribersByLanguage(String language) {
        List<Newsletter> newsletters = newsletterRepository.findByIsActiveTrueAndIsVerifiedTrueAndPreferredLanguage(language);
        return newsletters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NewsletterResponse> getSubscribersWithInterest(Newsletter.Interest interest) {
        List<Newsletter> newsletters = newsletterRepository.findActiveSubscribersWithInterest(interest);
        return newsletters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<NewsletterResponse> getAllSubscriptions(Pageable pageable) {
        Page<Newsletter> newsletters = newsletterRepository.findAllByOrderBySubscribedAtDesc(pageable);
        return newsletters.map(this::mapToResponse);
    }

    @Override
    public Long getActiveSubscriberCount() {
        return newsletterRepository.countActiveSubscribers();
    }

    @Override
    @Transactional
    public void cleanupExpiredSubscriptions() {
        List<Newsletter> expiredSubscriptions = newsletterRepository
                .findExpiredUnverifiedSubscriptions(LocalDateTime.now());
        
        if (!expiredSubscriptions.isEmpty()) {
            newsletterRepository.deleteAll(expiredSubscriptions);
            log.info("Cleaned up {} expired unverified newsletter subscriptions", expiredSubscriptions.size());
        }
    }

    @Override
    public void sendVerificationEmail(String email, String token) {
        try {
            String verificationLink = frontendUrl + "/newsletter/confirm/" + token;
            String subject = "Xác thực đăng ký newsletter - Japanese Learning Platform";
            String content = buildVerificationEmailContent(verificationLink);
            
            emailService.sendEmail(email, subject, content);
            log.info("Verification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", email, e.getMessage());
        }
    }

    private String buildVerificationEmailContent(String verificationLink) {
        return String.format("""
            <html>
            <body>
                <h2>Xác thực đăng ký newsletter</h2>
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã đăng ký newsletter của Japanese Learning Platform!</p>
                <p>Để hoàn tất quá trình đăng ký, vui lòng nhấp vào liên kết dưới đây:</p>
                <p><a href="%s" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xác thực email</a></p>
                <p>Hoặc sao chép và dán liên kết sau vào trình duyệt:</p>
                <p>%s</p>
                <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
                <p>Nếu bạn không đăng ký newsletter này, vui lòng bỏ qua email này.</p>
                <br>
                <p>Trân trọng,<br>Đội ngũ Japanese Learning Platform</p>
            </body>
            </html>
            """, verificationLink, verificationLink);
    }

    private NewsletterResponse mapToResponse(Newsletter newsletter) {
        return NewsletterResponse.builder()
                .id(newsletter.getId())
                .email(newsletter.getEmail())
                .fullName(newsletter.getFullName())
                .isActive(newsletter.getIsActive())
                .isVerified(newsletter.getIsVerified())
                .preferredLanguage(newsletter.getPreferredLanguage())
                .interests(newsletter.getInterests())
                .subscribedAt(newsletter.getSubscribedAt())
                .updatedAt(newsletter.getUpdatedAt())
                .unsubscribedAt(newsletter.getUnsubscribedAt())
                .build();
    }
} 