package com.example.demo;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@RestController
public class ImageController {

    @GetMapping("/api/images/{imageName}")
    public ResponseEntity<byte[]> getImage(@PathVariable String imageName) throws IOException {
        // Load the image from the file system
        Path imagePath = Paths.get("upload", imageName);
        byte[] imageBytes = Files.readAllBytes(imagePath);

        // Set cache control headers to prevent caching
//        CacheControl cacheControl = CacheControl.noCache().noStore().mustRevalidate().maxAge(0, TimeUnit.SECONDS);

        // Return the image with cache control headers
        return ResponseEntity.ok()
//                .cacheControl(cacheControl)
                .body(imageBytes);
    }
}
