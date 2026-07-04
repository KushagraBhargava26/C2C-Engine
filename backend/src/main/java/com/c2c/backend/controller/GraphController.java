package com.c2c.backend.controller;

import com.c2c.backend.dto.GraphResponseDTO;
import com.c2c.backend.service.GraphService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/graph")
    public ResponseEntity<GraphResponseDTO> getGraph() {
        return ResponseEntity.ok(graphService.getGraph());
    }
}