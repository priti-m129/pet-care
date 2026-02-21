package com.example.healthypaws.controller;

import com.example.healthypaws.entity.Product;
import com.example.healthypaws.entity.User;
import com.example.healthypaws.entity.Role;
import com.example.healthypaws.repository.ProductRepository;
import com.example.healthypaws.repository.UserRepository;
import com.example.healthypaws.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository; // Added to fetch patients

    @Autowired
    private EmailService emailService; // Added to send emails

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping
    public Product createProduct(
            @RequestPart("name") String name,
            @RequestPart("price") String priceStr,
            @RequestPart("category") String category,
            @RequestPart("description") String description,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {

        System.out.println("--- Saving Product ---");
        System.out.println("Name: " + name);

        Product product = new Product();
        product.setName(name);

        try {
            product.setPrice(Double.parseDouble(priceStr));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid Price format");
        }

        product.setCategory(category);
        product.setDescription(description);

        // --- UPDATED IMAGE HANDLING ---
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String projectRoot = System.getProperty("user.dir");
                String uploadDir = projectRoot + "/uploads/";
                File directory = new File(uploadDir);
                if (!directory.exists()) directory.mkdirs();

                String originalFilename = imageFile.getOriginalFilename();
                String safeName = (originalFilename != null) ? originalFilename : "file.jpg";
                String uniqueFileName = System.currentTimeMillis() + "_" + safeName;

                File destFile = new File(uploadDir + uniqueFileName);
                imageFile.transferTo(destFile);

                String fileUrl = "http://localhost:8080/uploads/" + uniqueFileName;
                product.setImageUrl(fileUrl);

            } catch (IOException e) {
                System.err.println("Error saving file: " + e.getMessage());
                throw new RuntimeException("Failed to save image: " + e.getMessage());
            }
        } else {
            product.setImageUrl(null);
        }

        // Save Product
        Product savedProduct = productRepository.save(product);

        // --- SEND EMAIL TO ALL PATIENTS (Marketing Notification) ---
        try {
            List<User> patients = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == Role.PATIENT)
                    .collect(Collectors.toList());

            if (!patients.isEmpty()) {
                String subject = "New Arrival: " + savedProduct.getName();

                // Construct HTML Email
                String body = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                        + "<h2 style='color: #FF9800;'>New Product Added! 🐾</h2>"
                        + "<p>Exciting news! We have added a new item to our marketplace.</p>"

                        // Product Card Container
                        + "<div style='border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 500px; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);'>"

                        // Image
                        + (savedProduct.getImageUrl() != null ?
                        "<img src='" + savedProduct.getImageUrl() + "' alt='Product Image' style='width: 100%; height: auto; display: block;' />" :
                        "<div style='background-color: #f0f0f0; height: 200px; display: flex; align-items: center; justify-content: center; color: #888;'>No Image</div>")

                        // Details
                        + "<div style='padding: 15px;'>"
                        + "<h3 style='margin: 0 0 10px 0; color: #333;'>" + savedProduct.getName() + "</h3>"
                        + "<p style='color: #666; font-size: 14px; margin-bottom: 15px;'>" + savedProduct.getDescription() + "</p>"
                        + "<div style='display: flex; justify-content: space-between; align-items: center;'>"
                        + "<span style='font-size: 18px; font-weight: bold; color: #4CAF50;'>$" + savedProduct.getPrice() + "</span>"
                        + "<span style='font-size: 12px; color: #999; background: #eee; padding: 4px 8px; border-radius: 4px;'>" + savedProduct.getCategory() + "</span>"
                        + "</div>"
                        + "</div>"

                        + "</div>" // End Product Card

                        + "<div style='margin-top: 20px; text-align: center;'>"
                        + "<a href='http://localhost:5173/marketplace' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Visit Marketplace</a>"
                        + "</div>"

                        + "<br/><p>Happy Shopping!</p>"
                        + "<p><strong>Healthy Paws Team</strong></p>"
                        + "</div>";

                // Send to all patients
                for (User patient : patients) {
                    try {
                        emailService.sendSimpleEmail(patient.getEmail(), subject, body);
                    } catch (Exception e) {
                        System.err.println("Failed to send product email to " + patient.getEmail());
                    }
                }
                System.out.println("New product email sent to " + patients.size() + " patients.");
            } else {
                System.out.println("No patients found to notify about new product.");
            }

        } catch (Exception e) {
            System.err.println("Error during product email notification: " + e.getMessage());
            // We do not throw here to prevent product creation from failing if email fails
        }

        return savedProduct;
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }
}