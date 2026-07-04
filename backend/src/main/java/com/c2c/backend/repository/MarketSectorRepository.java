package com.c2c.backend.repository;

import com.c2c.backend.entity.MarketSector;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MarketSectorRepository extends JpaRepository<MarketSector, Long> {
    Optional<MarketSector> findByName(String name);
}