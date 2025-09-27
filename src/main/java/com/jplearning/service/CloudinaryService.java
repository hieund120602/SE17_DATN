package com.jplearning.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    /**
     * Upload file to Cloudinary
     *
     * @param file File to upload
     * @return Map containing upload result
     * @throws IOException If an I/O error occurs
     */
    Map<String, String> uploadFile(MultipartFile file) throws IOException;

    /**
     * Delete file from Cloudinary by public ID
     *
     * @param publicId Public ID of the file to delete
     * @return Map containing deletion result
     * @throws IOException If an I/O error occurs
     */
    Map<String, String> deleteFile(String publicId) throws IOException;

    /**
     * Upload image to Cloudinary with auto compression
     *
     * @param file Image file to upload
     * @return Map containing upload result
     * @throws IOException If an I/O error occurs
     */
    Map<String, String> uploadImage(MultipartFile file) throws IOException;

    /**
     * Upload video to Cloudinary
     *
     * @param file Video file to upload
     * @return Map containing upload result
     * @throws IOException If an I/O error occurs
     */
    Map<String, String> uploadVideo(MultipartFile file) throws IOException;

    /**
     * Generate a signed URL for a resource
     *
     * @param publicId Public ID of the resource
     * @return Signed URL with temporary access
     */
    String generateSignedUrl(String publicId);
}