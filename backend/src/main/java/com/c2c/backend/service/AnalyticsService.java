package com.c2c.backend.service;

import com.c2c.backend.dto.SectorImpactItemDTO;
import com.c2c.backend.dto.SectorImpactResponseDTO;
import com.c2c.backend.repository.ExposureLinkRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ExposureLinkRepository exposureRepo;

    public AnalyticsService(ExposureLinkRepository exposureRepo) {
        this.exposureRepo = exposureRepo;
    }

    public SectorImpactResponseDTO getSectorImpact() {
        List<Object[]> raw = exposureRepo.findSectorImpactRaw();

        List<SectorImpactItemDTO> items = raw.stream()
                .map(row -> new SectorImpactItemDTO(
                        (String) row[0],
                        (Double) row[1],
                        (Long) row[2]
                ))
                .collect(Collectors.toList());

        return new SectorImpactResponseDTO(items);
    }
}