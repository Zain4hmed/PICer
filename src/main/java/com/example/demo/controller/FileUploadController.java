package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Value("${upload.dir}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestBody FileUploadRequest fileUploadRequest) {
        String fileName = StringUtils.cleanPath(fileUploadRequest.getFileName());

        if (!fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body("Only JPEG files are allowed.");
        }

        try {
            byte[] decodedBytes = Base64.getDecoder().decode(fileUploadRequest.getFileContent());

            // Define the upload directory path
            Path uploadPath = Paths.get(uploadDir);

            // Create the upload directory if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Define the file path within the upload directory
            Path filePath = uploadPath.resolve(fileName);

            // Write the decoded bytes to the file
            Files.write(filePath, decodedBytes);

            // Set cache control headers to disable caching
            CacheControl cacheControl = CacheControl.noCache().mustRevalidate()
                    .sMaxAge(0, TimeUnit.SECONDS).cachePrivate();

            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body("File uploaded successfully: " + fileName);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload the file: " + fileName);
        }
    }

    public static class FileUploadRequest {
        private String fileName;
        private String fileContent;

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public String getFileContent() {
            return fileContent;
        }

        public void setFileContent(String fileContent) {
            this.fileContent = fileContent;
        }
    }
}
