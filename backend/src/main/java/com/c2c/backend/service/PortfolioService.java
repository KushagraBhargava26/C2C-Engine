package com.c2c.backend.service;

import com.c2c.backend.dto.ChainNodeDTO;
import com.c2c.backend.dto.PortfolioExposureResponseDTO;
import com.c2c.backend.dto.PortfolioHoldingDTO;
import com.c2c.backend.entity.Holding;
import com.c2c.backend.repository.HoldingRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final HoldingRepository holdingRepo;

    public PortfolioService(HoldingRepository holdingRepo) {
        this.holdingRepo = holdingRepo;
    }

    public PortfolioExposureResponseDTO getPortfolioExposure() {
        List<Holding> holdings = holdingRepo.findAll();

        List<PortfolioHoldingDTO> holdingDTOs = holdings.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        // Illustrative total, documented as seeded (not derived from a real portfolio valuation)
        long totalExposureUsd = 2_460_000_000_000L;

        return new PortfolioExposureResponseDTO(totalExposureUsd, holdingDTOs, Instant.now());
    }

    private PortfolioHoldingDTO toDTO(Holding holding) {
        List<ChainNodeDTO> chain = buildIllustrativeChain(holding);
        return new PortfolioHoldingDTO(
                holding.getTicker(),
                holding.getName(),
                holding.getSector(),
                holding.getRegion(),
                holding.getExposurePct(),
                chain,
                true // isIllustrative
        );
    }

    private List<ChainNodeDTO> buildIllustrativeChain(Holding holding) {
        // Hand-authored causal chain per CONTRACT.md Decision Log — not AI-derived.
        return List.of(
                new ChainNodeDTO("Regional geopolitical incident", "EVENT", null),
                new ChainNodeDTO("Commodity price shift", "MARKET_SIGNAL", null),
                new ChainNodeDTO("Sector-wide cost impact", "MARKET_SIGNAL", null),
                new ChainNodeDTO(holding.getName(), "HOLDING", holding.getExposurePct())
        );
    }
}