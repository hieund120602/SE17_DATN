package com.jplearning.service.impl;

import com.jplearning.dto.request.LevelRequest;
import com.jplearning.dto.response.LevelResponse;
import com.jplearning.entity.Level;
import com.jplearning.exception.BadRequestException;
import com.jplearning.exception.ResourceNotFoundException;
import com.jplearning.repository.CourseRepository;
import com.jplearning.repository.LevelRepository;
import com.jplearning.service.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LevelServiceImpl implements LevelService {

    @Autowired
    private LevelRepository levelRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public List<LevelResponse> getAllLevels() {
        List<Level> levels = levelRepository.findAll();
        return levels.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<LevelResponse> getLevels(Pageable pageable) {
        Page<Level> levels = levelRepository.findAll(pageable);
        return levels.map(this::mapToResponse);
    }

    @Override
    public LevelResponse getLevelById(Long id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + id));

        return mapToResponse(level);
    }

    @Override
    @Transactional
    public LevelResponse createLevel(LevelRequest request) {
        // Check if level with same name already exists
        if (levelRepository.existsByName(request.getName())) {
            throw new BadRequestException("Level with name '" + request.getName() + "' already exists");
        }

        Level level = new Level();
        level.setName(request.getName());
        level.setDescription(request.getDescription());

        Level savedLevel = levelRepository.save(level);

        return mapToResponse(savedLevel);
    }

    @Override
    @Transactional
    public LevelResponse updateLevel(Long id, LevelRequest request) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + id));

        // Check if new name conflicts with existing level
        if (!level.getName().equals(request.getName()) &&
                levelRepository.existsByName(request.getName())) {
            throw new BadRequestException("Level with name '" + request.getName() + "' already exists");
        }

        level.setName(request.getName());
        level.setDescription(request.getDescription());

        Level updatedLevel = levelRepository.save(level);

        return mapToResponse(updatedLevel);
    }

    @Override
    @Transactional
    public void deleteLevel(Long id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + id));

        // Check if level is used by any courses
        if (!level.getCourses().isEmpty()) {
            throw new BadRequestException("Cannot delete level that is used by courses");
        }

        levelRepository.delete(level);
    }

    private LevelResponse mapToResponse(Level level) {
        int courseCount = level.getCourses() != null ? level.getCourses().size() : 0;

        return LevelResponse.builder()
                .id(level.getId())
                .name(level.getName())
                .description(level.getDescription())
                .courseCount(courseCount)
                .createdAt(level.getCreatedAt())
                .updatedAt(level.getUpdatedAt())
                .build();
    }
}