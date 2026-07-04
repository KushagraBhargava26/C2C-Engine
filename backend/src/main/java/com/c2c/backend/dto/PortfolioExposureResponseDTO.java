package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PortfolioExposureResponseDTO {
    private Long totalExposureUsd;
    private List<PortfolioHoldingDTO> holdings;
    private Instant generatedAt;
}