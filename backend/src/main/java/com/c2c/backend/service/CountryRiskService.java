package com.c2c.backend.service;

import com.c2c.backend.dto.CountryRiskDetailDTO;
import com.c2c.backend.entity.ExposureLink;
import com.c2c.backend.entity.IncidentEvent;
import com.c2c.backend.repository.ExposureLinkRepository;
import com.c2c.backend.repository.IncidentEventRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CountryRiskService {

    private final IncidentEventRepository incidentRepo;
    private final ExposureLinkRepository exposureRepo;

    public CountryRiskService(IncidentEventRepository incidentRepo, ExposureLinkRepository exposureRepo) {
        this.incidentRepo = incidentRepo;
        this.exposureRepo = exposureRepo;
    }

    public CountryRiskDetailDTO getCountryRisk(String isoCode) {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        List<IncidentEvent> recentIncidents = incidentRepo.findByRegionAndCreatedAtAfter(isoCode, sevenDaysAgo);

        if (recentIncidents.isEmpty()) {
            throw new NoSuchElementException("No incidents found for region: " + isoCode);
        }

        // riskScore: average confidence of MEDIUM+ risk incidents, scaled 0-100
        List<IncidentEvent> significant = recentIncidents.stream()
                .filter(i -> i.getRiskLevel() != IncidentEvent.RiskLevel.LOW)
                .collect(Collectors.toList());

        double avgConfidence = significant.isEmpty()
                ? recentIncidents.stream().mapToDouble(IncidentEvent::getConfidenceScore).average().orElse(0.0)
                : significant.stream().mapToDouble(IncidentEvent::getConfidenceScore).average().orElse(0.0);

        int riskScore = (int) Math.round(avgConfidence * 100);
        String riskLevel = deriveRiskLevel(riskScore);

        List<String> affectedSectors = exposureRepo.findByCountry_IsoCode(isoCode).stream()
                .map(ExposureLink::getSector)
                .map(sector -> sector.getName())
                .distinct()
                .collect(Collectors.toList());

        // marketImpactPct: simplified proportional value; positive = adverse impact
        double marketImpactPct = Math.round((riskScore / 20.0) * 10) / 10.0;

        return new CountryRiskDetailDTO(
                isoCode,
                riskScore,
                riskLevel,
                recentIncidents.size(),
                affectedSectors,
                marketImpactPct,
                Instant.now()
        );
    }

    private String deriveRiskLevel(int score) {
        if (score >= 75) return "CRITICAL";
        if (score >= 50) return "HIGH";
        if (score >= 25) return "MEDIUM";
        return "LOW";
    }
}