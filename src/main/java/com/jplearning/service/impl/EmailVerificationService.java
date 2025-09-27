package com.jplearning.service.impl;

import com.jplearning.entity.PasswordResetToken;
import com.jplearning.entity.User;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.PasswordResetTokenRepository;
import com.jplearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmailVerificationService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Verify user email with token
     * @param token verification token
     * @return true if verification successful
     */
    @Transactional
    public boolean verifyEmail(String token) {
        // Log token for debugging
        System.out.println("Verifying token: " + token);

        PasswordResetToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        // Log token details for debugging
        System.out.println("Token found: " + verificationToken.getId() + ", User: " +
                (verificationToken.getUser() != null ? verificationToken.getUser().getEmail() : "null") +
                ", Expires: " + verificationToken.getExpiryDate());

        if (verificationToken.isExpired()) {
            tokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found for the given token");
        }

        // Enable the user account
        user.setEnabled(true);
        userRepository.save(user);

        // Delete used token
        tokenRepository.delete(verificationToken);

        return true;
    }
}