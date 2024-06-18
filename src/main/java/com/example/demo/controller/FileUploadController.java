package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;
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

    // Assuming your application is running from the root of your project
    private static final String UPLOAD_DIR = Paths.get("src", "main", "upload").toAbsolutePath().toString();

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

    @DeleteMapping("/wipeout")
    public ResponseEntity<String> deleteImages(){
        File directory = new File(UPLOAD_DIR);

        if(!directory.exists() || !directory.isDirectory()){
            return new ResponseEntity<>("Directory does not exist or is not a directory", HttpStatus.BAD_REQUEST);
        }

        File[] files = directory.listFiles();
        if(files == null || files.length == 0){
            return new ResponseEntity<>("No files to delete",HttpStatus.OK);
        }

        for(File file : files){
            if(file.isFile()){
                try {
                    boolean deleted = file.delete();
                    if(!deleted){
                        return new ResponseEntity<>("Failed to delete file : "+file.getName(),HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }catch (SecurityException e){
                    return new ResponseEntity<>("Permission denied : "+e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
        }

        return new ResponseEntity<>("All files deleted successfully",HttpStatus.OK);
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
