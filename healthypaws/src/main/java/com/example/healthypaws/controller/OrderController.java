package com.example.healthypaws.controller;

import com.example.healthypaws.entity.Order;
import com.example.healthypaws.entity.User;
import com.example.healthypaws.repository.OrderRepository;
import com.example.healthypaws.repository.UserRepository;
import com.example.healthypaws.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // --- 1. CREATE ORDER ---
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        // Save the order
        Order savedOrder = orderRepository.save(order);

        // Auto-fill email if missing
        if (savedOrder.getEmail() == null || savedOrder.getEmail().isEmpty()) {
            User user = userRepository.findById(savedOrder.getUserId()).orElse(null);
            if (user != null) {
                savedOrder.setEmail(user.getEmail());
                savedOrder = orderRepository.save(savedOrder);
                System.out.println(">>> Auto-filled email for order " + savedOrder.getId() + ": " + user.getEmail());
            }
        }

        // --- EMAIL LOGIC BASED ON INITIAL STATUS ---
        if ("PAID".equalsIgnoreCase(savedOrder.getStatus()) || "COMPLETED".equalsIgnoreCase(savedOrder.getStatus())) {
            sendOrderBookedAndPaidEmail(savedOrder);
        }
        else if ("PROCESSING".equalsIgnoreCase(savedOrder.getStatus())) {
            // Send "Order Received" email when created as Processing
            sendProcessingEmail(savedOrder);
        }

        return savedOrder;
    }

    // --- 2. UPDATE ORDER STATUS ---
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            String oldStatus = order.getStatus();
            String newStatus = request.get("status");

            System.out.println(">>> Updating Order ID: " + id + " to status: " + newStatus);

            if (newStatus != null && !newStatus.equals(oldStatus)) {

                order.setStatus(newStatus);
                Order savedOrder = orderRepository.save(order);

                // --- EMAIL LOGIC ---
                String recipientEmail = savedOrder.getEmail();
                if (recipientEmail == null || recipientEmail.isEmpty()) {
                    User user = userRepository.findById(savedOrder.getUserId()).orElse(null);
                    if (user != null) recipientEmail = user.getEmail();
                }

                if (recipientEmail != null) {

                    // 1. Check if Payment Done
                    if ("PAID".equalsIgnoreCase(newStatus) || "COMPLETED".equalsIgnoreCase(newStatus)) {
                        sendOrderBookedAndPaidEmail(savedOrder);
                    }
                    // 2. Check if Processing (Order Received)
                    else if ("PROCESSING".equalsIgnoreCase(newStatus)) {
                        sendProcessingEmail(savedOrder);
                    }
                    // 3. Other statuses
                    else {
                        sendGenericStatusEmail(savedOrder, newStatus);
                    }
                } else {
                    System.err.println("!!! Cannot send email: No email found for Order ID " + id);
                }

                return ResponseEntity.ok(savedOrder);
            } else {
                return ResponseEntity.ok(order);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ---------------------------------------------------------
    // EMAIL METHODS
    // ---------------------------------------------------------

    // EMAIL 1: Order Booked & Paid
    private void sendOrderBookedAndPaidEmail(Order order) {
        String subject = "Order Booked Successfully & Payment Done #" + order.getId();

        String body = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4CAF50;'>Order Booked Successfully! 🎉</h2>"
                + "<p>Hello,</p>"
                + "<p>Your payment has been processed successfully and your order has been booked.</p>"

                + "<div style='background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;'>"
                + "<strong>Payment Status:</strong> <span style='text-decoration: underline;'>DONE</span><br>"
                + "<strong>Order Status:</strong> <span style='font-weight:bold; color: #155724;'>CONFIRMED</span>"
                + "</div>"

                + "<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>"
                + "<tr style='background-color: #f9f9f9;'>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Order ID:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + order.getId() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Total Amount Paid:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl; font-weight:bold; color: #333;'>$" + order.getTotal() + "</td>"
                + "</tr>"
                + "</table>"

                + "<br/><p>We will dispatch your products shortly.</p>"
                + "<p>Thank you for shopping with Healthy Paws!</p>"
                + "</div>";

        try {
            emailService.sendSimpleEmail(order.getEmail(), subject, body);
            System.out.println("✅ Payment Success & Booking email sent to: " + order.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }

    // EMAIL 2: Processing (Order Received) - NEW METHOD
    private void sendProcessingEmail(Order order) {
        String subject = "Order Received - Processing #" + order.getId();

        String body = "<div style='font-family: Arial, sans-serif; color: #333;'>"

                + "<h2 style='color: #FF9800;'>Order Received! 📦</h2>"
                + "<p>Hello,</p>"
                + "<p>We have received your order request. We are currently processing it and preparing your items.</p>"

                // Status Box
                + "<div style='background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffeeba;'>"
                + "<strong>Order Status:</strong> <span style='font-weight:bold; text-transform: uppercase;'>PROCESSING</span>"
                + "</div>"

                + "<p>We will notify you once it is shipped.</p>"

                + "<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>"
                + "<tr style='background-color: #f9f9f9;'>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Order ID:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl;'>" + order.getId() + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td style='padding: 10px; border: 1px solid #ddd;'><strong>Total Amount:</strong></td>"
                + "<td style='padding: 10px; border: 1px solid #ddl; font-weight:bold; color: #333;'>$" + order.getTotal() + "</td>"
                + "</tr>"
                + "</table>"

                + "<br/><p>Thank you for your patience.</p>"
                + "<p><strong>Healthy Paws Team</strong></p>"
                + "</div>";

        try {
            emailService.sendSimpleEmail(order.getEmail(), subject, body);
            System.out.println("✅ Processing email sent to: " + order.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }

    // EMAIL 3: Generic Update
    private void sendGenericStatusEmail(Order order, String status) {
        String subject = "Order Update: #" + order.getId();
        String body = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #2196F3;'>Order Update</h2>"
                + "<p>Your order status is now: <strong>" + status + "</strong></p>"
                + "<p>Order ID: " + order.getId() + "</p>"
                + "<p>Thank you!</p>"
                + "</div>";

        try {
            emailService.sendSimpleEmail(order.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }

    // --- GETTERS & DELETERS ---
    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/my-orders/{userId}")
    public List<Order> getMyOrders(@PathVariable Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}