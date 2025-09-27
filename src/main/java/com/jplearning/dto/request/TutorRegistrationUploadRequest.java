package com.jplearning.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class TutorRegistrationUploadRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private String confirmPassword;
    private String identityCardNumber;
    private String homeAddress;
    private String teachingRequirements;
    private String educationsJson;
    private String experiencesJson;
    private List<String> certificateUrls;
}
