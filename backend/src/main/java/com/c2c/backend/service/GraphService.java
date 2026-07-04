package com.c2c.backend.service;

import com.c2c.backend.dto.GraphEdgeDTO;
import com.c2c.backend.dto.GraphNodeDTO;
import com.c2c.backend.dto.GraphResponseDTO;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class GraphService {

    public GraphResponseDTO getGraph() {
        // Hand-authored static graph per CONTRACT.md Decision Log — not AI-derived.
        List<GraphNodeDTO> nodes = List.of(
                new GraphNodeDTO("n1", "Russia", "COUNTRY"),
                new GraphNodeDTO("n2", "EU Sanctions", "EVENT"),
                new GraphNodeDTO("n3", "Oil", "COMMODITY"),
                new GraphNodeDTO("n4", "Reliance Industries", "HOLDING"),
                new GraphNodeDTO("n5", "India", "COUNTRY"),
                new GraphNodeDTO("n6", "Energy Sector", "SECTOR")
        );

        List<GraphEdgeDTO> edges = List.of(
                new GraphEdgeDTO("n1", "n2", "SANCTIONED_BY"),
                new GraphEdgeDTO("n2", "n3", "IMPACTS"),
                new GraphEdgeDTO("n3", "n6", "IMPACTS"),
                new GraphEdgeDTO("n6", "n4", "IMPACTS"),
                new GraphEdgeDTO("n5", "n4", "ALLIED_WITH")
        );

        return new GraphResponseDTO(nodes, edges, Instant.now());
    }
}