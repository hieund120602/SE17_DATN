package com.jplearning.service.impl;

import com.jplearning.service.TutorEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class TutorEmailServiceImpl implements TutorEmailService {
    private static final Logger logger = LoggerFactory.getLogger(TutorEmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public TutorEmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendWelcomeEmail(String email, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Chào mừng bạn đến với Japanese Learning Platform!");
            message.setText(
                "Xin chào " + fullName + ",\n\n" +
                "Cảm ơn bạn đã đăng ký làm gia sư tại Japanese Learning Platform!\n\n" +
                "Đơn đăng ký của bạn đã được ghi nhận và đang được xem xét bởi đội ngũ quản trị viên.\n" +
                "Chúng tôi sẽ thông báo kết quả trong thời gian sớm nhất.\n\n" +
                "Trong khi chờ đợi, bạn có thể:\n" +
                "- Chuẩn bị các tài liệu giảng dạy\n" +
                "- Xem qua các khóa học hiện có\n" +
                "- Tìm hiểu về quy trình giảng dạy\n\n" +
                "Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ Japanese Learning Platform"
            );

            mailSender.send(message);
            logger.info("Welcome email sent successfully to tutor: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to tutor: {}", email, e);
        }
    }

    @Override
    public void sendApplicationStatusEmail(String email, String fullName, String status, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            
            if ("approved".equalsIgnoreCase(status)) {
                message.setSubject("Đơn đăng ký gia sư của bạn đã được chấp thuận!");
                message.setText(
                    "Xin chào " + fullName + ",\n\n" +
                    "Chúc mừng! Đơn đăng ký làm gia sư của bạn đã được chấp thuận.\n\n" +
                    "Bây giờ bạn có thể:\n" +
                    "- Đăng nhập vào hệ thống\n" +
                    "- Tạo khóa học của riêng mình\n" +
                    "- Bắt đầu giảng dạy\n\n" +
                    "Chúng tôi rất mong được hợp tác với bạn!\n\n" +
                    "Trân trọng,\n" +
                    "Đội ngũ Japanese Learning Platform"
                );
            } else {
                message.setSubject("Thông báo về đơn đăng ký gia sư");
                message.setText(
                    "Xin chào " + fullName + ",\n\n" +
                    "Chúng tôi rất tiếc phải thông báo rằng đơn đăng ký làm gia sư của bạn chưa được chấp thuận.\n\n" +
                    "Lý do: " + (reason != null ? reason : "Không có thông tin chi tiết") + "\n\n" +
                    "Bạn có thể:\n" +
                    "- Cập nhật thông tin cá nhân\n" +
                    "- Bổ sung thêm chứng chỉ và kinh nghiệm\n" +
                    "- Đăng ký lại sau 30 ngày\n\n" +
                    "Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi.\n\n" +
                    "Trân trọng,\n" +
                    "Đội ngũ Japanese Learning Platform"
                );
            }

            mailSender.send(message);
            logger.info("Application status email sent successfully to tutor: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send application status email to tutor: {}", email, e);
        }
    }
}

