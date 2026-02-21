package com.example.healthypaws.repository;

import com.example.healthypaws.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Custom method to find orders by User ID
    List<Order> findByUserId(Long userId);
}