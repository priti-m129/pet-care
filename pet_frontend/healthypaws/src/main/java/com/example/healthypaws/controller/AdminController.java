package com.example.healthypaws.controller;

import com.example.healthypaws.entity.User;
import com.example.healthypaws.entity.Role;
import com.example.healthypaws.repository.UserRepository;
import com.example.healthypaws.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException; // <--- IMPORT THIS
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveDoctor(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (user.getRole() != Role.DOCTOR) {
            return ResponseEntity.badRequest().body("This user is not a doctor.");
        }

        user.setApproved(true);
        userRepository.save(user);

        String subject = "Application Approved";
        String body = "Hello " + user.getName() + ",\n\n" +
                "Admin approved your application. You can login now.";

        emailService.sendSimpleEmail(user.getEmail(), subject, body);

        return ResponseEntity.ok("Doctor approved successfully and notified.");
    }

    // --- UPDATED DELETE METHOD ---
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            // Check if user exists
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                return ResponseEntity.ok("User deleted successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
        } catch (DataIntegrityViolationException e) {
            // SPECIFIC ERROR HANDLING: User has appointments/pets
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cannot delete user. This user has active records (appointments, pets, or orders).");
        } catch (Exception e) {
            // GENERIC ERROR
            e.printStackTrace(); // Print to server console for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server error: " + e.getMessage());
        }
    }
}