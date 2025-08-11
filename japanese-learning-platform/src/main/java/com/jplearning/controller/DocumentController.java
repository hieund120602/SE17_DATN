package com.jplearning.controller;

import com.jplearning.entity.Resource;
import com.jplearning.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/{resourceId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TUTOR') or hasRole('ADMIN')")
    public ResponseEntity<Resource> getDocument(@PathVariable String resourceId) {
        try {
            // Verify if the current user has access to this resource
            // This depends on your business logic

            // Generate a signed URL for the resource
            String signedUrl = cloudinaryService.generateSignedUrl(resourceId);

            // Redirect to the signed URL
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, signedUrl)
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}