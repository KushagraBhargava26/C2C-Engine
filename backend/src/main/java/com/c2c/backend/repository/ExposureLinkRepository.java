package com.c2c.backend.repository;

import com.c2c.backend.entity.ExposureLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExposureLinkRepository extends JpaRepository<ExposureLink, Long> {
    List<ExposureLink> findByCountry_IsoCode(String isoCode);

    @Query("SELECT e.sector.name as sector, AVG(e.exposureScore) as avgScore, COUNT(e) as cnt " +
            "FROM ExposureLink e GROUP BY e.sector.name")
    List<Object[]> findSectorImpactRaw();
}