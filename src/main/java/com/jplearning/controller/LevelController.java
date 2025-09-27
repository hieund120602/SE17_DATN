package com.jplearning.controller;

import com.jplearning.dto.request.LevelRequest;
import com.jplearning.dto.response.LevelResponse;
import com.jplearning.service.LevelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/levels")
@Tag(name = "Level Management", description = "APIs for managing course levels")
@CrossOrigin(origins = "*")
public class LevelController {

    @Autowired
    private LevelService levelService;

    @GetMapping
    @Operation(summary = "Get all levels", description = "Get all levels for courses")
    public ResponseEntity<List<LevelResponse>> getAllLevels() {
        return ResponseEntity.ok(levelService.getAllLevels());
    }

    @GetMapping("/paginated")
    @Operation(
            summary = "Get levels with pagination",
            description = "Get paginated list of levels"
    )
    public ResponseEntity<Page<LevelResponse>> getLevelsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(levelService.getLevels(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get level by ID", description = "Get level details by ID")
    public ResponseEntity<LevelResponse> getLevelById(@PathVariable Long id) {
        return ResponseEntity.ok(levelService.getLevelById(id));
    }

    @PostMapping
    @Operation(
            summary = "Create level",
            description = "Create a new level (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LevelResponse> createLevel(@Valid @RequestBody LevelRequest request) {
        LevelResponse createdLevel = levelService.createLevel(request);
        return new ResponseEntity<>(createdLevel, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update level",
            description = "Update an existing level (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LevelResponse> updateLevel(
            @PathVariable Long id,
            @Valid @RequestBody LevelRequest request) {
        return ResponseEntity.ok(levelService.updateLevel(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete level",
            description = "Delete an existing level (admin only)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        levelService.deleteLevel(id);
        return ResponseEntity.noContent().build();
    }
}