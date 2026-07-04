package com.c2c.backend.controller;

import com.c2c.backend.dto.CountryRiskDetailDTO;
import com.c2c.backend.service.CountryRiskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/countries")
public class CountryController {

    private final CountryRiskService countryRiskService;

    public CountryController(CountryRiskService countryRiskService) {
        this.countryRiskService = countryRiskService;
    }

    @GetMapping("/{isoCode}")
    public ResponseEntity<CountryRiskDetailDTO> getCountryRisk(@PathVariable String isoCode) {
        return ResponseEntity.ok(countryRiskService.getCountryRisk(isoCode));
    }
}