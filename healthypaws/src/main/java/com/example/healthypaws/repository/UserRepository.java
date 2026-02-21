package com.example.healthypaws.repository;

import com.example.healthypaws.entity.User;
import com.example.healthypaws.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndIsApprovedTrue(Role role);

    // Needed for Admin to find a doctor by ID
    User findUserById(Long id);
}