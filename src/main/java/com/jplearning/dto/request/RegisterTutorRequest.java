package com.jplearning.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class RegisterTutorRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone number must contain 10-11 digits")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotBlank(message = "Identity card number is required")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "Identity card number must contain 9-12 digits")
    private String identityCardNumber;

    @NotBlank(message = "Home address is required")
    @Size(min = 10, max = 500, message = "Home address must be between 10 and 500 characters")
    private String homeAddress;

    private String teachingRequirements;

    @Valid
    private List<EducationRequest> educations;

    @Valid
    private List<ExperienceRequest> experiences;

    private List<String> certificateUrls;
}