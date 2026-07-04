package com.c2c.backend.controller;

import com.c2c.backend.dto.PortfolioExposureResponseDTO;
import com.c2c.backend.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/exposure")
    public ResponseEntity<PortfolioExposureResponseDTO> getPortfolioExposure() {
        return ResponseEntity.ok(portfolioService.getPortfolioExposure());
    }
}