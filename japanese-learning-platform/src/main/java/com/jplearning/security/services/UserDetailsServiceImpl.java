package com.jplearning.security.services;

import com.jplearning.entity.User;
import com.jplearning.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + username));

        // Check if account is enabled (email verified)
        if (!user.isEnabled()) {
            throw new DisabledException("Account is not activated. Please verify your email.");
        }

        // Check if account is blocked by admin
        if (user.isBlocked()) {
            throw new LockedException("Your account has been blocked. Please contact administrator.");
        }

        return UserDetailsImpl.build(user);
    }
}