package com.jplearning.controller;

import com.jplearning.dto.response.ComboResponse;
import com.jplearning.exception.BadRequestException;
import com.jplearning.service.ComboService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/combos")
@Tag(name = "Public Combo APIs", description = "APIs for accessing public course combo information")
@CrossOrigin(origins = "*")
public class PublicComboController {

    @Autowired
    private ComboService comboService;

    @GetMapping
    @Operation(summary = "Get active combos", description = "Get all active course combos with pagination")
    public ResponseEntity<Page<ComboResponse>> getActiveCombos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(comboService.getActiveCombos(pageable));
    }

    @GetMapping("/{comboId}")
    @Operation(summary = "Get combo details", description = "Get details of a specific active combo by ID")
    public ResponseEntity<ComboResponse> getComboById(@PathVariable Long comboId) {
        ComboResponse combo = comboService.getComboById(comboId);

        // Ensure combo is active for public viewing
        if (!combo.isActive()) {
            throw new BadRequestException("Combo not found or not available");
        }

        return ResponseEntity.ok(combo);
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Get combos by course", description = "Get all combos that include a specific course")
    public ResponseEntity<List<ComboResponse>> getCombosByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(comboService.getCombosByCourse(courseId));
    }
}
