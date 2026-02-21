package com.example.healthypaws.controller;

import com.example.healthypaws.entity.Pet;
import com.example.healthypaws.entity.User;
import com.example.healthypaws.repository.PetRepository;
import com.example.healthypaws.repository.UserRepository;
import com.example.healthypaws.service.EmailService; // Import EmailService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "http://localhost:5173")
public class PetController {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService; // Inject EmailService

    @GetMapping("/pets/{userId}")
    public List<Pet> getPetsByUser(@PathVariable Long userId) {
        return petRepository.findByUserId(userId);
    }

    // --- ADD PET + HTML EMAIL ---
    @PostMapping("/pets")
    public Pet addPet(@RequestBody Pet pet) {
        // 1. Find and set the User
        User user = userRepository.findById(pet.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        pet.setUser(user);

        // 2. Save the Pet
        Pet savedPet = petRepository.save(pet);

        // 3. Send Email (HTML Format)
        String subject = "Pet Profile Created Successfully";

        String body = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4CAF50;'>New Pet Added!</h2>"
                + "<p>Hello <strong>" + user.getName() + "</strong>,</p>"
                + "<p>Great news! Your pet " + savedPet.getName() + " has been successfully added to your account.</p>"

                // Details Table
                + "<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>"
                + "<tr style='background-color: #f9f9f9;'>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Pet Name:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + savedPet.getName() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Breed:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + savedPet.getBreed() + "</td>"
                + "</tr>"
                + "<tr style='background-color: #f9f9f9;'>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Age:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + savedPet.getAge() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Weight:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + savedPet.getWeight() + " kg</td>"
                + "</tr>"
                + "</table>"

                + "<p style='margin-top: 15px;'>You can now book appointments for your new pet.</p>"
                + "<br/><p>Best Regards,<br/><strong>Healthy Paws Team</strong></p>"
                + "</div>";

        try {
            emailService.sendSimpleEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return savedPet;
    }

    // --- UPDATE PET + HTML EMAIL ---
    @PutMapping("/pets/{petId}")
    public Pet updatePet(@PathVariable Long petId, @RequestBody Pet petDetails) {
        // 1. Fetch existing pet
        Pet existingPet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // 2. Update fields
        existingPet.setName(petDetails.getName());
        existingPet.setBreed(petDetails.getBreed());
        existingPet.setAge(petDetails.getAge());
        existingPet.setWeight(petDetails.getWeight());
        existingPet.setType(petDetails.getType());

        // 3. Save updates
        Pet updatedPet = petRepository.save(existingPet);

        // 4. Fetch Owner (to get email)
        User owner = userRepository.findById(updatedPet.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 5. Send Email (HTML Format)
        String subject = "Pet Profile Updated";

        String body = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #2196F3;'>Pet Profile Updated</h2>"
                + "<p>Hello <strong>" + owner.getName() + "</strong>,</p>"
                + "<p>The profile for <strong>" + updatedPet.getName() + "</strong> has been successfully updated.</p>"

                // Details Table
                + "<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>"
                + "<tr style='background-color: #f9f9f9;'>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Breed:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + updatedPet.getBreed() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Age:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + updatedPet.getAge() + "</td>"
                + "</tr>"
                + "<tr style='background-color: #f9f9f9;'>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Weight:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + updatedPet.getWeight() + " kg</td>"
                + "</tr>"
                + "</table>"

                + "<br/><p>Best Regards,<br/><strong>Healthy Paws Team</strong></p>"
                + "</div>";

        try {
            emailService.sendSimpleEmail(owner.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return updatedPet;
    }

    // --- DELETE PET + HTML EMAIL ---
    @DeleteMapping("/pets/{petId}")
    public void deletePet(@PathVariable Long petId) {
        // 1. Fetch the pet FIRST to get the owner's email
        Pet petToDelete = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // 2. Fetch Owner details
        User owner = userRepository.findById(petToDelete.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Delete the pet
        petRepository.deleteById(petId);

        // 4. Send Email (HTML Format)
        String subject = "Pet Profile Deleted";

        String body = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #d9534f;'>Pet Profile Removed</h2>"
                + "<p>Hello <strong>" + owner.getName() + "</strong>,</p>"
                + "<p>The profile for <strong>" + petToDelete.getName() + "</strong> has been removed from your account.</p>"

                // Warning Box
                + "<div style='background-color: #f8d7da; color: #721c24; padding: 10px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #f5c6cb;'>"
                + "Action Completed"
                + "</div>"

                + "<p>If you did this by mistake, please contact support.</p>"
                + "<br/><p>Best Regards,<br/><strong>Healthy Paws Team</strong></p>"
                + "</div>";

        try {
            emailService.sendSimpleEmail(owner.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}