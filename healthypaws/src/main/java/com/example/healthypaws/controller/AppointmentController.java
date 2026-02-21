package com.example.healthypaws.controller;

import com.example.healthypaws.entity.Appointment;
import com.example.healthypaws.entity.DoctorAvailability;
import com.example.healthypaws.entity.Role;
import com.example.healthypaws.entity.User;
import com.example.healthypaws.repository.AppointmentRepository;
import com.example.healthypaws.repository.UserRepository;
import com.example.healthypaws.repository.DoctorAvailabilityRepository;
import com.example.healthypaws.service.EmailService; // Import EmailService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;

    @Autowired
    private EmailService emailService; // Inject EmailService

    @GetMapping("/appointments/{userId}")
    public List<Appointment> getAppointmentsByUser(@PathVariable Long userId) {
        return appointmentRepository.findByPatientId(userId);
    }

    @GetMapping("/appointments/doctor/{doctorId}")
    public List<Appointment> getAppointmentsForDoctor(@PathVariable Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    @GetMapping("/doctors")
    public List<User> getDoctors() {
        return userRepository.findByRoleAndIsApprovedTrue(Role.DOCTOR);
    }

    @PostMapping("/appointments")
    public Appointment bookAppointment(@RequestBody Appointment appointment) {
        // 1. Check Slot Availability (Lock Logic)
        List<Appointment> existingAppts = appointmentRepository.findByDoctorIdAndDate(
                appointment.getDoctor().getId(), appointment.getDate());

        boolean isSlotTaken = existingAppts.stream()
                .anyMatch(a -> a.getTime().equals(appointment.getTime()) &&
                        !"CANCELLED".equalsIgnoreCase(a.getStatus()) &&
                        !"REJECTED".equalsIgnoreCase(a.getStatus()));

        if (isSlotTaken) throw new RuntimeException("Slot already booked.");

        // 2. Set Status to COMPLETED immediately
        appointment.setStatus("COMPLETED");

        // 3. Save Patient & Doctor Details
        User patient = userRepository.findById(appointment.getPatient().getId()).orElseThrow();
        appointment.setPatient(patient);
        appointment.setPatientName(patient.getName());

        // Declare doctor outside the if block so we can use it for the email later
        User doctor = null;

        if (appointment.getDoctor() != null && appointment.getDoctor().getId() != null) {
            doctor = userRepository.findById(appointment.getDoctor().getId()).orElseThrow();
            appointment.setDoctor(doctor);
            appointment.setDoctorName(doctor.getName());

            Integer doctorFee = (doctor.getFee() != null) ? doctor.getFee() : 500;
            appointment.setDoctorFee(doctorFee);
            Integer typeFee = (appointment.getTypeFee() != null) ? appointment.getTypeFee() : 0;
            appointment.setTypeFee(typeFee);
            appointment.setFee(doctorFee + typeFee);
        }

        // 4. Save the appointment to database
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 5. Send Email to Patient
        // We send this here because the status is set to "COMPLETED" in this method
        try {
            if (patient.getEmail() != null && doctor != null) {
                String subject = "Appointment Booked Successfully - Healthy Paws";

                // Build HTML Content here since we cannot change the Service file
                String htmlBody = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;'>" +
                        "<h2 style='color: #2e7d32;'>Appointment Confirmed! 🐾</h2>" +
                        "<p>Dear <strong>" + patient.getName() + "</strong>,</p>" +
                        "<p>Your appointment has been successfully booked and confirmed.</p>" +
                        "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;'>" +
                        "<p style='margin: 5px 0;'><strong>Doctor:</strong> Dr. " + doctor.getName() + "</p>" +
                        "<p style='margin: 5px 0;'><strong>Date:</strong> " + savedAppointment.getDate() + "</p>" +
                        "<p style='margin: 5px 0;'><strong>Time:</strong> " + savedAppointment.getTime() + "</p>" +
                        "<p style='margin: 5px 0;'><strong>Status:</strong> " + savedAppointment.getStatus() + "</p>" +
                        "</div>" +
                        "<p>Please arrive 10 minutes prior to your appointment.</p>" +
                        "<br>" +
                        "<p>Thank you for choosing <strong>Healthy Paws</strong>!</p>" +
                        "</div>";

                // Call the existing service method
                emailService.sendSimpleEmail(patient.getEmail(), subject, htmlBody);
                System.out.println("Email trigger attempt made for: " + patient.getEmail());
            }
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            // We do not throw the error up to avoid failing the booking if email fails
        }

        return savedAppointment;
    }

    @PutMapping("/appointments/{id}")
    public Appointment updateAppointment(@PathVariable Long id, @RequestBody Appointment updateData) {
        Appointment existingAppt = appointmentRepository.findById(id).orElseThrow();
        // Doctor can update status, prescription, etc.
        if (updateData.getStatus() != null) existingAppt.setStatus(updateData.getStatus());
        if (updateData.getPrescription() != null) existingAppt.setPrescription(updateData.getPrescription());
        if (updateData.getPaymentMethod() != null) existingAppt.setPaymentMethod(updateData.getPaymentMethod());
        if (updateData.getPaymentStatus() != null) existingAppt.setPaymentStatus(updateData.getPaymentStatus());
        if (updateData.getRazorpayPaymentId() != null) existingAppt.setRazorpayPaymentId(updateData.getRazorpayPaymentId());
        if (updateData.getRating() != null) existingAppt.setRating(updateData.getRating());
        if (updateData.getReviewComment() != null) existingAppt.setReviewComment(updateData.getReviewComment());
        return appointmentRepository.save(existingAppt);
    }

    @DeleteMapping("/appointments/{apptId}")
    public void cancelAppointment(@PathVariable Long apptId) {
        appointmentRepository.deleteById(apptId);
    }

    // --- AVAILABILITY LOGIC ---
    @GetMapping("/doctor/availability/{doctorId}")
    public List<DoctorAvailability> getDoctorAvailability(@PathVariable Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId);
    }

    @PostMapping("/doctor/availability")
    public List<DoctorAvailability> saveDoctorAvailability(@RequestBody List<DoctorAvailability> scheduleList) {
        if (scheduleList == null || scheduleList.isEmpty()) return new ArrayList<>();
        Long doctorId = scheduleList.get(0).getDoctor().getId();
        List<DoctorAvailability> oldRecords = availabilityRepository.findByDoctorId(doctorId);
        if (!oldRecords.isEmpty()) availabilityRepository.deleteAll(oldRecords);
        List<DoctorAvailability> savedList = new ArrayList<>();
        for (DoctorAvailability avail : scheduleList) {
            if (avail.getDoctor() == null || avail.getDoctor().getId() == null) continue;
            User doctor = userRepository.findById(avail.getDoctor().getId()).orElseThrow();
            avail.setDoctor(doctor);
            savedList.add(availabilityRepository.save(avail));
        }
        return savedList;
    }

    @GetMapping("/availability/slots")
    public List<String> getAvailableSlots(@RequestParam Long doctorId, @RequestParam String date) {
        List<String> availableSlots = new ArrayList<>();
        try {
            LocalDate appointmentDate = LocalDate.parse(date);
            String dayName = appointmentDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            Optional<DoctorAvailability> scheduleOpt = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, dayName);
            if (scheduleOpt.isEmpty()) return availableSlots;
            DoctorAvailability schedule = scheduleOpt.get();
            LocalTime start = schedule.getStartTime();
            LocalTime end = schedule.getEndTime();
            List<LocalTime> allPossibleSlots = new ArrayList<>();
            while (start.isBefore(end)) { allPossibleSlots.add(start); start = start.plusMinutes(30); }
            List<Appointment> bookedAppts = appointmentRepository.findByDoctorIdAndDate(doctorId, appointmentDate);
            // Logic: Slot is only free if Cancelled or Rejected. Completed slots remain blocked.
            Set<String> bookedTimes = bookedAppts.stream()
                    .filter(appt -> !"CANCELLED".equalsIgnoreCase(appt.getStatus()) && !"REJECTED".equalsIgnoreCase(appt.getStatus()))
                    .map(Appointment::getTime).map(t -> t.length() > 5 ? t.substring(0, 5) : t).collect(Collectors.toSet());
            for (LocalTime slot : allPossibleSlots) if (!bookedTimes.contains(slot.toString())) availableSlots.add(slot.toString());
        } catch (Exception e) { e.printStackTrace(); }
        return availableSlots;
    }
}