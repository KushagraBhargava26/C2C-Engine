package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CountryRiskDetailDTO {
    private String region;
    private Integer riskScore;
    private String riskLevel;
    private Integer activeEvents;
    private List<String> affectedSectors;
    private Double marketImpactPct;
    private Instant lastUpdated;
}