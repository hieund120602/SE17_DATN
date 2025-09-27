package com.jplearning.service.impl;

import com.jplearning.dto.request.UpdateTutorProfileRequest;
import com.jplearning.dto.response.MessageResponse;
import com.jplearning.dto.response.TutorResponse;
import com.jplearning.entity.Tutor;
import com.jplearning.repository.TutorRepository;
import com.jplearning.service.AdminTutorService;
import com.jplearning.service.TutorEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class AdminTutorServiceImpl implements AdminTutorService {

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private TutorEmailService tutorEmailService;

    @Override
    public Page<TutorResponse> getAllTutors(Pageable pageable) {
        Page<Tutor> tutors = tutorRepository.findAll(pageable);
        return tutors.map(this::mapToTutorResponse);
    }

    @Override
    public Page<TutorResponse> getPendingTutors(Pageable pageable) {
        Page<Tutor> pendingTutors = tutorRepository.findByEnabled(false, pageable);
        return pendingTutors.map(this::mapToTutorResponse);
    }

    @Override
    @Transactional
    public MessageResponse approveTutor(Long tutorId) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        if (tutor.isEnabled()) {
            return new MessageResponse("Tutor is already approved");
        }

        tutor.setEnabled(true);
        tutorRepository.save(tutor);

        // Send approval email
        tutorEmailService.sendApplicationStatusEmail(
                tutor.getEmail(),
                tutor.getFullName(),
                "approved",
                null
        );

        return new MessageResponse("Tutor approved successfully");
    }

    @Override
    @Transactional
    public MessageResponse rejectTutor(Long tutorId, String reason) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        if (tutor.isEnabled()) {
            return new MessageResponse("Cannot reject already approved tutor");
        }

        // Send rejection email
        tutorEmailService.sendApplicationStatusEmail(
                tutor.getEmail(),
                tutor.getFullName(),
                "rejected",
                reason
        );

        // Delete rejected tutor
        tutorRepository.delete(tutor);

        return new MessageResponse("Tutor rejected successfully");
    }

    @Override
    @Transactional
    public TutorResponse updateTutorProfile(Long tutorId, UpdateTutorProfileRequest request) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        // Update basic information
        if (request.getFullName() != null) {
            tutor.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            tutor.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            tutor.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getTeachingRequirements() != null) {
            tutor.setTeachingRequirements(request.getTeachingRequirements());
        }

        // Update educations
        if (request.getEducations() != null) {
            // Clear existing educations and add new ones
            tutor.getEducations().clear();
            request.getEducations().forEach(eduRequest -> {
                // Map education request to entity and add to tutor
                // This would need proper mapping logic
            });
        }

        // Update experiences
        if (request.getExperiences() != null) {
            // Clear existing experiences and add new ones
            tutor.getExperiences().clear();
            request.getExperiences().forEach(expRequest -> {
                // Map experience request to entity and add to tutor
                // This would need proper mapping logic
            });
        }

        Tutor savedTutor = tutorRepository.save(tutor);
        return mapToTutorResponse(savedTutor);
    }

    private TutorResponse mapToTutorResponse(Tutor tutor) {
        TutorResponse response = new TutorResponse();
        response.setId(tutor.getId());
        response.setFullName(tutor.getFullName());
        response.setEmail(tutor.getEmail());
        response.setPhoneNumber(tutor.getPhoneNumber());
        response.setAvatarUrl(tutor.getAvatarUrl());
        response.setTeachingRequirements(tutor.getTeachingRequirements());
        response.setEnabled(tutor.isEnabled());
        response.setBlocked(tutor.isBlocked());
        response.setCreatedAt(tutor.getCreatedAt());
        response.setUpdatedAt(tutor.getUpdatedAt());

        // Map certificates
        if (tutor.getCertificateUrls() != null) {
            response.setCertificates(tutor.getCertificateUrls());
        }

        // Map educations
        if (tutor.getEducations() != null) {
            response.setEducations(tutor.getEducations().stream()
                    .map(this::mapToEducationResponse)
                    .collect(Collectors.toList()));
        }

        // Map experiences
        if (tutor.getExperiences() != null) {
            response.setExperiences(tutor.getExperiences().stream()
                    .map(this::mapToExperienceResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private TutorResponse.EducationResponse mapToEducationResponse(com.jplearning.entity.Education education) {
        TutorResponse.EducationResponse response = new TutorResponse.EducationResponse();
        response.setId(education.getId());
        response.setInstitution(education.getInstitution());
        response.setDegree(education.getDegree());
        response.setFieldOfStudy(education.getFieldOfStudy());
        response.setStartDate(education.getStartDate().toString());
        response.setEndDate(education.getEndDate() != null ? education.getEndDate().toString() : null);
        response.setDescription(education.getDescription());
        return response;
    }

    private TutorResponse.ExperienceResponse mapToExperienceResponse(com.jplearning.entity.Experience experience) {
        TutorResponse.ExperienceResponse response = new TutorResponse.ExperienceResponse();
        response.setId(experience.getId());
        response.setCompany(experience.getCompany());
        response.setPosition(experience.getPosition());
        response.setStartDate(experience.getStartDate().toString());
        response.setEndDate(experience.getEndDate() != null ? experience.getEndDate().toString() : null);
        response.setDescription(experience.getDescription());
        response.setCurrent(experience.isCurrent());
        return response;
    }
}
