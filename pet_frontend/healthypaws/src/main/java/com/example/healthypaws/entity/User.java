package com.example.healthypaws.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // --- DOCUMENT FIELDS ---
    private String documentStatus; // PENDING, APPROVED, REJECTED

    private String mbbsDegree;         // Field 1
    private String medicalRegistration;// Field 2
    private String resume;             // Field 3
    private String identityProof;      // Field 4
    // ----------------------

    private boolean isApproved;
    private String qualification;
    private String specialization;
    private String clinicName;
    private LocalDateTime createdAt;

    // --- UPDATED: DOCTOR FEE DEFAULT ---
    // Setting default value to 500 ensures new doctors start with this fee
    private Integer fee = 500;
}