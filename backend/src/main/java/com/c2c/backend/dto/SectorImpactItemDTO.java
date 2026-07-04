package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SectorImpactItemDTO {
    private String sector;
    private Double avgExposureScore;
    private Long incidentCount;
}