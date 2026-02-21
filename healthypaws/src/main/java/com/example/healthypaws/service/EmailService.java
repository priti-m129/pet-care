package com.example.healthypaws.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

// NOTE: If you get a red line on MimeMessage below, change the import
// from jakarta.mail... to javax.mail... depending on your Spring Boot version.
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // We keep the name 'sendSimpleEmail' so your Controllers compile successfully.
    // But the internal logic now uses HTML.
    public void sendSimpleEmail(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // 'true' allows multipart (HTML)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@healthypaws.com");
            helper.setTo(toEmail);
            helper.setSubject(subject);

            // 'true' here enables HTML.
            // This means whatever string you pass in will be rendered as a webpage.
            helper.setText(body, true);

            mailSender.send(message);
            System.out.println("HTML Email sent successfully to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}