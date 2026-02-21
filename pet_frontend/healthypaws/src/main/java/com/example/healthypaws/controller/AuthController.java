package com.example.healthypaws.controller;

import com.example.healthypaws.entity.User;
import com.example.healthypaws.entity.Role;
import com.example.healthypaws.repository.UserRepository;
import com.example.healthypaws.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Directory where files will be saved
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // ---------------------------------------------------------
    // 1. LOGIN (Allows Pending Doctors to Login)
    // ---------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String role = request.get("role");

        // Admin Login
        if ("admin".equals(role)) {
            if ("admin".equals(email) && "admin".equals(password)) {
                Map<String, Object> adminData = new HashMap<>();
                adminData.put("id", 0L);
                adminData.put("name", "Admin");
                adminData.put("role", Role.ADMIN);
                return ResponseEntity.ok(adminData);
            }
            return ResponseEntity.status(401).body("Invalid admin credentials");
        }

        // User Login
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(401).body("User not found.");
        }

        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid credentials.");
        }

        // NOTE: We removed the (!user.isApproved()) check for doctors here.
        // This allows them to login to the restricted view to upload documents.

        return ResponseEntity.ok(user);
    }

    // ---------------------------------------------------------
    // 2. REGISTER (Initializes Document Status)
    // ---------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if email already exists
        User existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser != null) {
            return ResponseEntity.badRequest().body("User already exists with this email");
        }

        user.setCreatedAt(LocalDateTime.now());
        User savedUser;

        if (user.getRole() == Role.PATIENT) {
            // Patient: Approved immediately
            user.setApproved(true);
            savedUser = userRepository.save(user);

            // --- HTML EMAIL: PATIENT REGISTRATION ---
            String patientBody = ""
                    + "<div style='font-family: Arial, sans-serif; color: #333;'>"
                    + "<h2 style='color: #4CAF50;'>Welcome to Healthy Paws!</h2>"
                    + "<p>Hello <strong>" + user.getName() + "</strong>,</p>"
                    + "<p>Your account has been successfully created.</p>"
                    + "<p>You can now login and book appointments for your pets.</p>"
                    + "<br>"
                    + "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px;'>"
                    + "<a href='http://localhost:5173/login' style='text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px;'>Login Now</a>"
                    + "</div>"
                    + "<br><br>"
                    + "<p>Best Regards,</p>"
                    + "<p><strong>Healthy Paws Team</strong></p>"
                    + "</div>";

            sendEmailSafe(user.getEmail(), "Registration Completed", patientBody);

        } else if (user.getRole() == Role.DOCTOR) {
            // Doctor: Set status to PENDING
            user.setApproved(false);
            user.setDocumentStatus("PENDING"); // Default status
            savedUser = userRepository.save(user);

            // --- HTML EMAIL: DOCTOR REGISTRATION (Pending) ---
            String doctorBody = ""
                    + "<div style='font-family: Arial, sans-serif; color: #333;'>"
                    + "<h2 style='color: #FF9800;'>Registration Received</h2>"
                    + "<p>Hello Dr. <strong>" + user.getName() + "</strong>,</p>"
                    + "<p>We have received your registration.</p>"

                    // Warning Box
                    + "<div style='background-color: #fff3cd; border-left: 5px solid #ffeb3b; padding: 10px; margin: 15px 0;'>"
                    + "<strong>Status:</strong> <span style='color: #d9534f;'>PENDING VERIFICATION</span>"
                    + "</div>"

                    + "<p>Please login to the portal and upload your documents (MBBS, ID, etc.) so our admin team can verify your identity.</p>"
                    + "<br>"
                    + "<p><a href='http://localhost:5173/login' style='color: #2196F3; font-weight: bold;'>Go to Login Page</a></p>"
                    + "<br>"
                    + "<p>Best Regards,</p>"
                    + "<p><strong>Healthy Paws Team</strong></p>"
                    + "</div>";

            sendEmailSafe(user.getEmail(), "Registration Pending Verification", doctorBody);

        } else {
            savedUser = userRepository.save(user);
        }

        return ResponseEntity.ok(savedUser);
    }

    // ---------------------------------------------------------
    // 3. UPDATE PROFILE
    // ---------------------------------------------------------
    @PutMapping("/patient/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (user.getName() != null) existingUser.setName(user.getName());
        if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) existingUser.setPassword(user.getPassword());

        User updatedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(updatedUser);
    }

    // ---------------------------------------------------------
    // 4. UPLOAD DOCUMENT (Handles MBBS, Registration, Resume, ID)
    // ---------------------------------------------------------
    @PostMapping("/upload-document/{userId}")
    public ResponseEntity<User> uploadDocument(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) { // New type parameter

        try {
            // Create upload directory
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) directory.mkdirs();

            // Generate unique filename
            String fileName = userId + "_" + type + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);

            // Save file
            Files.write(filePath, file.getBytes());

            // Update User
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            // Switch case to save to the correct field
            switch (type.toLowerCase()) {
                case "mbbs":
                    user.setMbbsDegree(fileName);
                    break;
                case "registration":
                    user.setMedicalRegistration(fileName);
                    break;
                case "resume":
                    user.setResume(fileName);
                    break;
                case "identity":
                    user.setIdentityProof(fileName);
                    break;
            }

            // If status was REJECTED, reset to PENDING when they upload new files
            if ("REJECTED".equals(user.getDocumentStatus())) {
                user.setDocumentStatus("PENDING");
            }

            userRepository.save(user);
            return ResponseEntity.ok(user);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ---------------------------------------------------------
    // 5. ADMIN: APPROVE DOCUMENT
    // ---------------------------------------------------------
    @PostMapping("/admin/approve-doctor-document/{userId}")
    public ResponseEntity<?> approveDoctorDocument(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        user.setDocumentStatus("APPROVED");
        user.setApproved(true); // Unlock dashboard

        userRepository.save(user);

        // --- HTML EMAIL: APPROVAL ---
        String approvalBody = ""
                + "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4CAF50;'>Account Verified!</h2>"
                + "<p>Hello Dr. <strong>" + user.getName() + "</strong>,</p>"
                + "<p>We have reviewed your documents and everything looks good.</p>"
                + "<div style='background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0;'>"
                + "<strong>Success:</strong> Your dashboard is now unlocked."
                + "</div>"
                + "<p>You can now start accepting appointments and managing patients.</p>"
                + "<br>"
                + "<p><a href='http://localhost:5173/login' style='color: #2196F3;'>Go to Dashboard</a></p>"
                + "<br>"
                + "<p>Best Regards,</p>"
                + "<p><strong>Healthy Paws Team</strong></p>"
                + "</div>";

        sendEmailSafe(user.getEmail(), "Account Verified", approvalBody);

        return ResponseEntity.ok("Doctor approved and dashboard unlocked.");
    }

    // ---------------------------------------------------------
    // 6. ADMIN: REJECT DOCUMENT
    // ---------------------------------------------------------
    @PostMapping("/admin/reject-doctor-document/{userId}")
    public ResponseEntity<?> rejectDoctorDocument(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setDocumentStatus("REJECTED");
        // We do NOT clear the files so admin can see them again

        userRepository.save(user);
        return ResponseEntity.ok("Document rejected.");
    }

    // ---------------------------------------------------------
    // 7. GET USER STATUS (For Polling)
    // ---------------------------------------------------------
    @GetMapping("/user/{id}")
    public ResponseEntity<User> getUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    // Helper method to handle email errors
    private void sendEmailSafe(String toEmail, String subject, String body) {
        try {
            emailService.sendSimpleEmail(toEmail, subject, body);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send email to " + toEmail);
            e.printStackTrace();
        }
    }
}