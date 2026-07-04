package com.c2c.backend.controller;

import com.c2c.backend.dto.IncidentRequestDTO;
import com.c2c.backend.dto.IncidentResponseDTO;
import com.c2c.backend.dto.PagedIncidentResponseDTO;
import com.c2c.backend.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponseDTO> submitIncident(@Valid @RequestBody IncidentRequestDTO request) {
        IncidentResponseDTO result = incidentService.processNewIncident(
                request.getIncidentText(), request.getSourceRegion());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<PagedIncidentResponseDTO> getIncidents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(incidentService.getIncidents(pageable));
    }
}