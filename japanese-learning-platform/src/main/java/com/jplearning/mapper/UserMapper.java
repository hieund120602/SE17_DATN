package com.jplearning.mapper;

import com.jplearning.dto.request.RegisterStudentRequest;
import com.jplearning.dto.request.RegisterTutorRequest;
import com.jplearning.dto.response.EducationResponse;
import com.jplearning.dto.response.ExperienceResponse;
import com.jplearning.entity.Education;
import com.jplearning.entity.Experience;
import com.jplearning.entity.Student;
import com.jplearning.entity.Tutor;
import com.jplearning.dto.request.EducationRequest;
import com.jplearning.dto.request.ExperienceRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "enabled", constant = "false")
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Student studentRequestToStudent(RegisterStudentRequest registerRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "enabled", constant = "false")
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "certificateUrls", ignore = true)
    Tutor tutorRequestToTutor(RegisterTutorRequest registerRequest);

    @Mapping(target = "id", ignore = true)
    Education educationRequestToEducation(EducationRequest educationRequest);

    @Mapping(target = "id", ignore = true)
    Experience experienceRequestToExperience(ExperienceRequest experienceRequest);

    // Response mappings
    EducationResponse educationToEducationResponse(Education education);

    ExperienceResponse experienceToExperienceResponse(Experience experience);
}