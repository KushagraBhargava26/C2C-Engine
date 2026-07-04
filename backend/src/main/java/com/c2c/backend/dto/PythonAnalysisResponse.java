package com.c2c.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PythonAnalysisResponse {
    private String sentimentLabel;
    private Double confidenceScore;
    private String riskLevel;
    private String region;
    private String analyzedAt;
}