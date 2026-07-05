package com.c2c.backend.controller;

import com.c2c.backend.dto.IncidentVolumeResponseDTO;
import com.c2c.backend.dto.SectorImpactResponseDTO;
import com.c2c.backend.dto.SentimentTimeseriesResponseDTO;
import com.c2c.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/sector-impact")
    public ResponseEntity<SectorImpactResponseDTO> getSectorImpact() {
        return ResponseEntity.ok(analyticsService.getSectorImpact());
    }

    @GetMapping("/sentiment-timeseries")
    public ResponseEntity<SentimentTimeseriesResponseDTO> getSentimentTimeseries() {
        return ResponseEntity.ok(analyticsService.getSentimentTimeseries());
    }

    @GetMapping("/incident-volume")
    public ResponseEntity<IncidentVolumeResponseDTO> getIncidentVolume() {
        return ResponseEntity.ok(analyticsService.getIncidentVolume());
    }
}