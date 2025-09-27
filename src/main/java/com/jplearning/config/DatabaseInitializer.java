package com.jplearning.config;

import com.jplearning.entity.Role;
import com.jplearning.entity.Role.ERole;
import com.jplearning.entity.User;
import com.jplearning.repository.RoleRepository;
import com.jplearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@Order(1)
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        // Initialize roles
        initRoles();

        // Initialize admin account
        initAdminAccount();
    }

    private void initRoles() {
        // Check if roles are already initialized
        if (roleRepository.count() == 0) {
            // Create roles
            createRoleIfNotExists(ERole.ROLE_STUDENT);
            createRoleIfNotExists(ERole.ROLE_TUTOR);
            createRoleIfNotExists(ERole.ROLE_ADMIN);
            createRoleIfNotExists(ERole.ROLE_GUEST);
        }
    }

    private void createRoleIfNotExists(ERole name) {
        Optional<Role> roleOptional = roleRepository.findByName(name);
        if (roleOptional.isEmpty()) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
        }
    }

    private void initAdminAccount() {
        // Check if admin account already exists
        Optional<User> adminOptional = userRepository.findByEmail("admin@jplearning.com");
        if (adminOptional.isEmpty()) {
            User admin = new User();
            admin.setFullName("Admin");
            admin.setEmail("admin@jplearning.com");
            admin.setPassword(encoder.encode("Admin@123"));
            admin.setEnabled(true);

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);

            userRepository.save(admin);
        }
    }
}