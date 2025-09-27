package com.jplearning.service.impl;

import com.jplearning.entity.Level;
import com.jplearning.repository.LevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service to help with Level mapping in mapstruct mapper
 */
@Service
public class LevelMapperService {

    @Autowired
    private LevelRepository levelRepository;

    /**
     * Map level ID to Level entity
     * @param levelId Level ID
     * @return Level entity or null if not found
     */
    public Level mapIdToLevel(Long levelId) {
        if (levelId == null) {
            return null;
        }
        return levelRepository.findById(levelId).orElse(null);
    }

    /**
     * Map Level entity to ID
     * @param level Level entity
     * @return Level ID or null if entity is null
     */
    public Long mapLevelToId(Level level) {
        if (level == null) {
            return null;
        }
        return level.getId();
    }
}