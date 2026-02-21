package com.example.healthypaws.repository;

import com.example.healthypaws.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPetId(Long petId);
}