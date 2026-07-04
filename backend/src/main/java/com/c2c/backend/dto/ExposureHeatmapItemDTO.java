package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ExposureHeatmapItemDTO {
    private String region;
    private String sector;
    private Double exposureScore;
}