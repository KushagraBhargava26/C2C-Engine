package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PythonAnalysisRequest {
    private String incidentText;
    private String sourceRegion;
    private String timestamp;
}