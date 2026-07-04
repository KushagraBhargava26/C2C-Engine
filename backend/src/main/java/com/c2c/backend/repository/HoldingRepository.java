package com.c2c.backend.repository;

import com.c2c.backend.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
}