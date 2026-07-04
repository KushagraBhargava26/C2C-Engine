package com.c2c.backend.service;

import com.c2c.backend.client.PythonAnalysisClient;
import com.c2c.backend.dto.PythonAnalysisRequest;
import com.c2c.backend.dto.PythonAnalysisResponse;
import com.c2c.backend.entity.Country;
import com.c2c.backend.entity.ExposureLink;
import com.c2c.backend.entity.IncidentEvent;
import com.c2c.backend.entity.MarketSector;
import com.c2c.backend.repository.CountryRepository;
import com.c2c.backend.repository.ExposureLinkRepository;
import com.c2c.backend.repository.IncidentEventRepository;
import com.c2c.backend.repository.MarketSectorRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class IncidentService {

    private final PythonAnalysisClient pythonClient;
    private final IncidentEventRepository incidentRepo;
    private final CountryRepository countryRepo;
    private final MarketSectorRepository sectorRepo;
    private final ExposureLinkRepository exposureRepo;

    public IncidentService(
            PythonAnalysisClient pythonClient,
            IncidentEventRepository incidentRepo,
            CountryRepository countryRepo,
            MarketSectorRepository sectorRepo,
            ExposureLinkRepository exposureRepo) {
        this.pythonClient = pythonClient;
        this.incidentRepo = incidentRepo;
        this.countryRepo = countryRepo;
        this.sectorRepo = sectorRepo;
        this.exposureRepo = exposureRepo;
    }

    public IncidentEvent processNewIncident(String incidentText, String sourceRegion) {
        // Step 1: Call Python for sentiment/risk analysis
        PythonAnalysisRequest request = new PythonAnalysisRequest(
                incidentText, sourceRegion, Instant.now().toString());
        PythonAnalysisResponse analysis = pythonClient.analyze(request);

        // Step 2: Save the incident to DB
        IncidentEvent incident = new IncidentEvent();
        incident.setIncidentText(incidentText);
        incident.setRegion(sourceRegion);
        incident.setRiskLevel(IncidentEvent.RiskLevel.valueOf(analysis.getRiskLevel()));
        incident.setConfidenceScore(analysis.getConfidenceScore());
        incident.setCreatedAt(Instant.now());
        incidentRepo.save(incident);

        // Step 3: Ensure the country exists (create if not)
        Country country = countryRepo.findByIsoCode(sourceRegion)
                .orElseGet(() -> {
                    Country c = new Country();
                    c.setIsoCode(sourceRegion);
                    c.setName(sourceRegion); // placeholder name, can be improved later
                    return countryRepo.save(c);
                });

        return incident;
    }
}