package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
public class IncidentResponseDTO {
    private Long id;
    private String incidentText;
    private String region;
    private String riskLevel;
    private Double confidenceScore;
    private Instant createdAt;
}