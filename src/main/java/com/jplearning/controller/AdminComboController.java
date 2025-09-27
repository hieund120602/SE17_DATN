package com.jplearning.controller;

import com.jplearning.dto.request.ComboRequest;
import com.jplearning.dto.response.ComboResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.service.ComboService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/admin/combos")
@Tag(name = "Admin Combo Management", description = "APIs for admin to manage course combos")
@CrossOrigin(origins = "*")
public class AdminComboController {

    @Autowired
    private ComboService comboService;

    @PostMapping
    @Operation(
            summary = "Create a new combo",
            description = "Create a new course combo with special pricing",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComboResponse> createCombo(@Valid @RequestBody ComboRequest request) {
        return ResponseEntity.ok(comboService.createCombo(request));
    }

    @GetMapping
    @Operation(
            summary = "Get all combos",
            description = "Get all course combos with pagination",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ComboResponse>> getAllCombos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(comboService.getAllCombos(pageable));
    }

    @GetMapping("/{comboId}")
    @Operation(
            summary = "Get combo details",
            description = "Get details of a specific combo by ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComboResponse> getComboById(@PathVariable Long comboId) {
        return ResponseEntity.ok(comboService.getComboById(comboId));
    }

    @PutMapping("/{comboId}")
    @Operation(
            summary = "Update a combo",
            description = "Update an existing course combo",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComboResponse> updateCombo(
            @PathVariable Long comboId,
            @Valid @RequestBody ComboRequest request) {

        return ResponseEntity.ok(comboService.updateCombo(comboId, request));
    }

    @PostMapping(value = "/{comboId}/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload combo thumbnail",
            description = "Upload a thumbnail image for a course combo",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComboResponse> uploadThumbnail(
            @PathVariable Long comboId,
            @RequestParam("file") MultipartFile file) {

        try {
            return ResponseEntity.ok(comboService.uploadThumbnail(comboId, file));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload thumbnail: " + e.getMessage());
        }
    }

    @DeleteMapping("/{comboId}")
    @Operation(
            summary = "Delete a combo",
            description = "Delete an existing course combo",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long comboId) {
        comboService.deleteCombo(comboId);
        return ResponseEntity.noContent().build();
    }
}

