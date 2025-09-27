package com.jplearning.mapper;

import com.jplearning.dto.response.LevelResponse;
import com.jplearning.entity.Level;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Phương thức này đảm bảo CourseMapper có thể map Level entity thành LevelResponse
 */
@Mapper(componentModel = "spring")
public interface LevelMapper {

    /**
     * Chuyển đổi Level entity thành LevelResponse DTO
     * @param level Entity Level
     * @return LevelResponse DTO
     */
    @Mapping(target = "courseCount", expression = "java(level.getCourses() != null ? level.getCourses().size() : 0)")
    LevelResponse levelToResponse(Level level);
}