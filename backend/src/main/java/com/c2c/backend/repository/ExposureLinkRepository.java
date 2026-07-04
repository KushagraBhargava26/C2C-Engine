package com.c2c.backend.repository;

import com.c2c.backend.entity.ExposureLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExposureLinkRepository extends JpaRepository<ExposureLink, Long> {
    List<ExposureLink> findByCountry_IsoCode(String isoCode);
}