package com.example.healthypaws.controller;

import com.example.healthypaws.entity.Pet;
import com.example.healthypaws.entity.Prescription;
import com.example.healthypaws.repository.PetRepository;
import com.example.healthypaws.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:5173")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PetRepository petRepository;

    @GetMapping("/patients")
    public List<Map<String, Object>> getActivePatients() {
        List<Pet> pets = petRepository.findAllActivePets();

        return pets.stream().map(p -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", p.getId());
            data.put("petName", p.getName());
            data.put("ownerName", p.getUser() != null ? p.getUser().getName() : "Unknown");
            return data;
        }).collect(Collectors.toList());
    }

    @GetMapping("/prescriptions/{petId}")
    public List<Prescription> getPrescriptionsForPet(@PathVariable Long petId) {
        return prescriptionRepository.findByPetId(petId);
    }

    @PostMapping("/prescriptions")
    public Prescription issuePrescription(@RequestBody Prescription prescription) {
        Pet pet = petRepository.findById(prescription.getPet().getId()).orElseThrow();
        prescription.setPet(pet);
        prescription.setDateIssued(LocalDate.now());
        return prescriptionRepository.save(prescription);
    }
}