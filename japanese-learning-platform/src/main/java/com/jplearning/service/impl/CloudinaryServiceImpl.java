package com.jplearning.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.jplearning.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.*;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryServiceImpl.class);

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadFile(MultipartFile multipartFile) throws IOException {
        try {
            File file = convertMultipartToFile(multipartFile);

            Map<String, Object> params = new HashMap<>();

            // Check file content type
            String contentType = multipartFile.getContentType();
            logger.info("Uploading file with content type: {}", contentType);
            
            if (contentType != null) {
                // Handle audio files
                if (contentType.startsWith("audio/")) {
                    logger.info("Detected audio file. Setting resource_type to 'video' for audio handling");
                    params.put("resource_type", "video"); // Cloudinary uses "video" resource type for audio files
                    params.put("folder", "japanese_learning/audio");
                }
                // Handle documents
                else if (contentType.equals("application/pdf") || contentType.startsWith("application/")) {
                    params.put("resource_type", "raw");
                    params.put("folder", "japanese_learning/documents");
                }
                // Handle video files
                else if (contentType.startsWith("video/")) {
                    params.put("resource_type", "video");
                    params.put("folder", "japanese_learning/videos");
                }
                // Default to image (this is where we were failing)
                else {
                    params.put("resource_type", "image");
                    params.put("folder", "japanese_learning/images");
                }
            }

            logger.info("Uploading file to Cloudinary with params: {}", params);
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file, params);

            boolean isDeleted = file.delete();
            if (!isDeleted) {
                logger.warn("Failed to delete temporary file: {}", file.getAbsolutePath());
            }

            return extractUploadResult(uploadResult);
        } catch (IOException e) {
            logger.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Map<String, String> deleteFile(String publicId) throws IOException {
        try {
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            Map<String, String> result = new HashMap<>();
            result.put("result", String.valueOf(deleteResult.get("result")));
            return result;
        } catch (IOException e) {
            logger.error("Failed to delete file from Cloudinary", e);
            throw e;
        }
    }

    @Override
    public Map<String, String> uploadImage(MultipartFile multipartFile) throws IOException {
        try {
            File file = convertMultipartToFile(multipartFile);
            Map<String, Object> params = new HashMap<>();
            params.put("resource_type", "image");
            params.put("folder", "japanese_learning/images");
            params.put("quality", "auto");
            params.put("fetch_format", "auto");

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file, params);

            boolean isDeleted = file.delete();
            if (!isDeleted) {
                logger.warn("Failed to delete temporary file: {}", file.getAbsolutePath());
            }

            return extractUploadResult(uploadResult);
        } catch (IOException e) {
            logger.error("Failed to upload image to Cloudinary", e);
            throw e;
        }
    }

    @Override
    public Map<String, String> uploadVideo(MultipartFile multipartFile) throws IOException {
        try {
            File file = convertMultipartToFile(multipartFile);

            // Use the simplest possible parameters to avoid potential errors
            Map<String, Object> params = new HashMap<>();
            params.put("resource_type", "video");
            params.put("folder", "japanese_learning/videos");

            logger.info("Starting video upload to Cloudinary, size: {} bytes", file.length());
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file, params);
            logger.info("Video upload completed successfully");

            boolean isDeleted = file.delete();
            if (!isDeleted) {
                logger.warn("Failed to delete temporary file: {}", file.getAbsolutePath());
            }

            return extractUploadResult(uploadResult);
        } catch (Exception e) {
            logger.error("Failed to upload video to Cloudinary: {}", e.getMessage(), e);
            // For debugging, log the stack trace
            e.printStackTrace();
            // Rethrow as IOException to maintain method signature
            if (e instanceof IOException) {
                throw (IOException) e;
            } else {
                throw new IOException("Error uploading video: " + e.getMessage(), e);
            }
        }
    }

    private File convertMultipartToFile(MultipartFile multipartFile) throws IOException {
        String originalFilename = multipartFile.getOriginalFilename();
        String fileExtension = Objects.requireNonNull(originalFilename).substring(originalFilename.lastIndexOf("."));
        String tempFilename = UUID.randomUUID().toString() + fileExtension;

        File file = new File(System.getProperty("java.io.tmpdir") + File.separator + tempFilename);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(multipartFile.getBytes());
        }

        return file;
    }

    private Map<String, String> extractUploadResult(Map<String, Object> uploadResult) {
        Map<String, String> result = new HashMap<>();
        result.put("publicId", (String) uploadResult.get("public_id"));
        result.put("url", (String) uploadResult.get("url"));
        result.put("secureUrl", (String) uploadResult.get("secure_url"));
        result.put("format", (String) uploadResult.get("format"));

        if (uploadResult.containsKey("resource_type")) {
            result.put("resourceType", (String) uploadResult.get("resource_type"));
        }

        return result;
    }

    @Override
    public String generateSignedUrl(String publicId) {
        try {
            // Configure signed URL parameters
            Map<String, Object> params = new HashMap<>();
            params.put("public_id", publicId);
            params.put("format", "pdf"); // Adjust based on file type

            // Set expiration time (e.g., 1 hour from now)
            long expireAt = System.currentTimeMillis() / 1000 + 3600;
            params.put("expires_at", expireAt);

            // Generate signed URL
            String signedUrl = cloudinary.url()
                    .resourceType("raw")
                    .transformation(new Transformation().fetchFormat("pdf"))
//                    .format("pdf") // Adjust based on file type
                    .signed(true)
                    .signed(params.isEmpty())
                    .generate(publicId);

            return signedUrl;
        } catch (Exception e) {
            logger.error("Failed to generate signed URL for resource: {}", publicId, e);
            throw new RuntimeException("Failed to generate download URL", e);
        }
    }
}