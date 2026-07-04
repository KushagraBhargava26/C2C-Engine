package com.c2c.backend.repository;

import com.c2c.backend.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, Long> {
    Optional<Country> findByIsoCode(String isoCode);
}