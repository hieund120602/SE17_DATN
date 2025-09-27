package com.jplearning.service;

import com.jplearning.dto.request.ComboRequest;
import com.jplearning.dto.response.ComboResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ComboService {
    /**
     * Create a new course combo
     * @param request Combo details
     * @return Created combo response
     */
    ComboResponse createCombo(ComboRequest request);

    /**
     * Get combo by ID
     * @param comboId ID of the combo
     * @return Combo response
     */
    ComboResponse getComboById(Long comboId);

    /**
     * Update an existing combo
     * @param comboId ID of the combo to update
     * @param request Updated combo details
     * @return Updated combo response
     */
    ComboResponse updateCombo(Long comboId, ComboRequest request);

    /**
     * Upload thumbnail for a combo
     * @param comboId ID of the combo
     * @param file Thumbnail image file
     * @return Updated combo response
     * @throws IOException If an I/O error occurs
     */
    ComboResponse uploadThumbnail(Long comboId, MultipartFile file) throws IOException;

    /**
     * Delete a combo
     * @param comboId ID of the combo to delete
     */
    void deleteCombo(Long comboId);

    /**
     * Get all active combos with pagination
     * @param pageable Pagination information
     * @return Page of active combo responses
     */
    Page<ComboResponse> getActiveCombos(Pageable pageable);

    /**
     * Get all combos with pagination (admin only)
     * @param pageable Pagination information
     * @return Page of all combo responses
     */
    Page<ComboResponse> getAllCombos(Pageable pageable);

    /**
     * Get all available combos for a specific course
     * @param courseId ID of the course
     * @return List of combo responses containing the course
     */
    List<ComboResponse> getCombosByCourse(Long courseId);
}