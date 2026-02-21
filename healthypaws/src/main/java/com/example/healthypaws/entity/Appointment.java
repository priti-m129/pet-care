package com.example.healthypaws.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship to User (Patient)
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;

    // Relationship to User (Doctor)
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    // Basic Details
    private String patientName; // REQUIRED BY CONTROLLER
    private String doctorName;   // REQUIRED BY CONTROLLER
    private String petName;
    private String type; // e.g. General Checkup, Vaccination
    private LocalDate date;
    private String time;

    // Status & Payment
    private String status; // PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
    private String paymentStatus; // PENDING, PAID
    private String paymentMethod; // RAZORPAY

    // Razorpay Details
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;

    // Prescription & Review
    private String prescription;
    private Integer rating;
    private String reviewComment;

    // --- FEE BREAKDOWN FIELDS ---
    // Total Fee to be paid
    private Integer fee;

    // Base cost of service (sent from frontend)
    private Integer typeFee;

    // Cost specific to doctor (fetched from User table)
    private Integer doctorFee;
}