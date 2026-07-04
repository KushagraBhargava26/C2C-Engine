package com.c2c.backend.controller;

import com.c2c.backend.dto.ExposureHeatmapResponseDTO;
import com.c2c.backend.service.ExposureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exposure")
public class ExposureController {

    private final ExposureService exposureService;

    public ExposureController(ExposureService exposureService) {
        this.exposureService = exposureService;
    }

    @GetMapping("/heatmap")
    public ResponseEntity<ExposureHeatmapResponseDTO> getHeatmap() {
        return ResponseEntity.ok(exposureService.getHeatmap());
    }
}