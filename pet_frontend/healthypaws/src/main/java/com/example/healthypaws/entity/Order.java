package com.example.healthypaws.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    // --- IMPORTANT: This field must exist to send emails ---
    private String email;

    private Double total;
    private String status;
    private LocalDateTime orderDate;

    @Lob
    private String itemsJson;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    public Order() {}

    public Order(Long userId, String email, Double total, String status, String itemsJson, String deliveryAddress) {
        this.userId = userId;
        this.email = email;
        this.total = total;
        this.status = status;
        this.itemsJson = itemsJson;
        this.deliveryAddress = deliveryAddress;
        this.orderDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
}