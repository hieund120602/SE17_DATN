package com.jplearning.mapper;

import com.jplearning.dto.request.*;
import com.jplearning.dto.response.*;
import com.jplearning.entity.*;
import com.jplearning.entity.Module;
import com.jplearning.service.impl.LevelMapperService;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

import java.util.ArrayList;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {UserMapper.class, LevelMapperService.class}
)
public interface CourseMapper {
    CourseMapper INSTANCE = Mappers.getMapper(CourseMapper.class);

    // Entity to DTO mappings
    @Mapping(target = "modules", source = "modules")
    CourseResponse courseToResponse(Course course);

    ModuleResponse moduleToResponse(Module module);

    LessonResponse lessonToResponse(Lesson lesson);

    ResourceResponse resourceToResponse(Resource resource);

    ExerciseResponse exerciseToResponse(Exercise exercise);

    QuestionResponse questionToResponse(Question question);

    OptionResponse optionToResponse(Option option);

    @Mapping(target = "teachingRequirements", source = "teachingRequirements")
    TutorBriefResponse tutorToBriefResponse(Tutor tutor);

    // Map Level to response
    @Mapping(target = "courseCount", expression = "java(level.getCourses() != null ? level.getCourses().size() : 0)")
    LevelResponse levelToResponse(Level level);

    // DTO to Entity mappings
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "level", source = "levelId", qualifiedByName = "idToLevel")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "lessonCount", ignore = true)
    @Mapping(target = "countBuy", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "modules", expression = "java(new ArrayList<>())")
    Course requestToCourse(CourseRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lessons", expression = "java(new ArrayList<>())")
    Module requestToModule(ModuleRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "module", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "resources", ignore = true)
    @Mapping(target = "exercises", ignore = true)
    @Mapping(target = "discussions", ignore = true)
    Lesson requestToLesson(LessonRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Resource requestToResource(ResourceRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "questions", ignore = true)
    Exercise requestToExercise(ExerciseRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "exercise", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "options", ignore = true)
    Question requestToQuestion(QuestionRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "question", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Option requestToOption(OptionRequest request);

    // Update methods
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "level", ignore = true) // Level is handled separately in service
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "countBuy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "modules", ignore = true)
    void updateCourseFromRequest(CourseRequest request, @MappingTarget Course course);

    // Named mappers for Level
    @Named("idToLevel")
    default Level idToLevel(Long id) {
        // This will be handled by LevelMapperService via dependency injection
        return null;
    }

    @Named("levelToId")
    default Long levelToId(Level level) {
        // This will be handled by LevelMapperService via dependency injection
        return null;
    }
}