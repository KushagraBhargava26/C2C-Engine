package com.c2c.backend.service;

import com.c2c.backend.dto.ExposureHeatmapItemDTO;
import com.c2c.backend.dto.ExposureHeatmapResponseDTO;
import com.c2c.backend.entity.ExposureLink;
import com.c2c.backend.repository.ExposureLinkRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExposureService {

    private final ExposureLinkRepository exposureRepo;

    public ExposureService(ExposureLinkRepository exposureRepo) {
        this.exposureRepo = exposureRepo;
    }

    public ExposureHeatmapResponseDTO getHeatmap() {
        List<ExposureLink> links = exposureRepo.findAll();

        List<ExposureHeatmapItemDTO> items = links.stream()
                .map(link -> new ExposureHeatmapItemDTO(
                        link.getCountry().getIsoCode(),
                        link.getSector().getName(),
                        link.getExposureScore()
                ))
                .collect(Collectors.toList());

        return new ExposureHeatmapResponseDTO(items, Instant.now());
    }
}