package com.example.healthypaws.repository;

import com.example.healthypaws.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Standard CRUD methods (save, findAll, deleteById) are included automatically
}