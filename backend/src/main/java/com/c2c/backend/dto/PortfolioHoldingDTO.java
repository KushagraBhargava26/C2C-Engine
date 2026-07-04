package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PortfolioHoldingDTO {
    private String ticker;
    private String name;
    private String sector;
    private String region;
    private Double exposurePct;
    private List<ChainNodeDTO> chain;
    private boolean isIllustrative;
}