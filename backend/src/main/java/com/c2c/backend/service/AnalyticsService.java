package com.c2c.backend.service;

import com.c2c.backend.dto.*;
import com.c2c.backend.entity.IncidentEvent;
import com.c2c.backend.repository.ExposureLinkRepository;
import com.c2c.backend.repository.IncidentEventRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ExposureLinkRepository exposureRepo;
    private final IncidentEventRepository incidentRepo;

    public AnalyticsService(ExposureLinkRepository exposureRepo, IncidentEventRepository incidentRepo) {
        this.exposureRepo = exposureRepo;
        this.incidentRepo = incidentRepo;
    }

    public SectorImpactResponseDTO getSectorImpact() {
        List<Object[]> raw = exposureRepo.findSectorImpactRaw();

        List<SectorImpactItemDTO> items = raw.stream()
                .map(row -> new SectorImpactItemDTO(
                        (String) row[0],
                        (Double) row[1],
                        (Long) row[2]
                ))
                .collect(Collectors.toList());

        return new SectorImpactResponseDTO(items);
    }

    public SentimentTimeseriesResponseDTO getSentimentTimeseries() {
        Instant windowStart = Instant.now().minus(24, ChronoUnit.HOURS);
        List<IncidentEvent> incidents = incidentRepo.findByCreatedAtAfter(windowStart);

        // Group by hour bucket (truncated timestamp)
        Map<Instant, List<Double>> buckets = new TreeMap<>();
        for (IncidentEvent incident : incidents) {
            Instant hourBucket = incident.getCreatedAt().truncatedTo(ChronoUnit.HOURS);
            double signedSentiment = toSignedSentiment(incident);
            buckets.computeIfAbsent(hourBucket, k -> new java.util.ArrayList<>()).add(signedSentiment);
        }

        List<SentimentTimeseriesPointDTO> points = buckets.entrySet().stream()
                .map(entry -> new SentimentTimeseriesPointDTO(
                        entry.getKey(),
                        entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0)
                ))
                .collect(Collectors.toList());

        return new SentimentTimeseriesResponseDTO("24h", points);
    }

    private double toSignedSentiment(IncidentEvent incident) {
        boolean isNegativeSignal = incident.getRiskLevel() != IncidentEvent.RiskLevel.LOW;
        double confidence = incident.getConfidenceScore();
        return isNegativeSignal ? -confidence : confidence * 0.3;
    }
}