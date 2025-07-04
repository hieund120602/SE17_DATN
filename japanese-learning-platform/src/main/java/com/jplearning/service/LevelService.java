package com.jplearning.service;

import com.jplearning.dto.request.LevelRequest;
import com.jplearning.dto.response.LevelResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LevelService {
    /**
     * Get all levels
     * @return List of all levels
     */
    List<LevelResponse> getAllLevels();

    /**
     * Get paginated levels
     * @param pageable Pagination information
     * @return Page of levels
     */
    Page<LevelResponse> getLevels(Pageable pageable);

    /**
     * Get level by ID
     * @param id Level ID
     * @return Level
     */
    LevelResponse getLevelById(Long id);

    /**
     * Create a new level
     * @param request Level creation request
     * @return Created level
     */
    LevelResponse createLevel(LevelRequest request);

    /**
     * Update an existing level
     * @param id Level ID
     * @param request Level update request
     * @return Updated level
     */
    LevelResponse updateLevel(Long id, LevelRequest request);

    /**
     * Delete a level
     * @param id Level ID
     */
    void deleteLevel(Long id);
}