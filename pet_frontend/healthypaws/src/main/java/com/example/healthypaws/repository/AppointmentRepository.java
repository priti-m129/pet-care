package com.example.healthypaws.repository;

import com.example.healthypaws.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate; // Make sure this import is present
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // --- EXISTING METHODS ---
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);

    // --- ADD THIS MISSING METHOD ---
    // This allows finding appointments for a specific doctor on a specific date
    List<Appointment> findByDoctorIdAndDate(Long doctorId, LocalDate date);
}