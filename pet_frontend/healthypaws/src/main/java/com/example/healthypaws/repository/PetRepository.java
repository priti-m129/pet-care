package com.example.healthypaws.repository;

import com.example.healthypaws.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByUserId(Long userId);

    @Query("SELECT p FROM Pet p JOIN FETCH p.user u WHERE u.role = 'PATIENT'")
    List<Pet> findAllActivePets();
}