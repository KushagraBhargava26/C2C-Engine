package com.c2c.backend.config;

import com.c2c.backend.entity.Country;
import com.c2c.backend.entity.ExposureLink;
import com.c2c.backend.entity.Holding;
import com.c2c.backend.entity.MarketSector;
import com.c2c.backend.repository.CountryRepository;
import com.c2c.backend.repository.ExposureLinkRepository;
import com.c2c.backend.repository.HoldingRepository;
import com.c2c.backend.repository.MarketSectorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CountryRepository countryRepo;
    private final MarketSectorRepository sectorRepo;
    private final ExposureLinkRepository exposureRepo;
    private final HoldingRepository holdingRepo;

    public DataSeeder(CountryRepository countryRepo,
                       MarketSectorRepository sectorRepo,
                       ExposureLinkRepository exposureRepo,
                       HoldingRepository holdingRepo) {
        this.countryRepo = countryRepo;
        this.sectorRepo = sectorRepo;
        this.exposureRepo = exposureRepo;
        this.holdingRepo = holdingRepo;
    }

    @Override
    public void run(String... args) {
        if (countryRepo.count() > 0) {
            System.out.println("Seed data already exists, skipping seeding.");
            return;
        }

        // Seed countries
        Map<String, String> countryData = Map.of(
                "IN", "India",
                "US", "United States",
                "CN", "China"
        );
        countryData.forEach((iso, name) -> {
            Country c = new Country();
            c.setIsoCode(iso);
            c.setName(name);
            countryRepo.save(c);
        });

        // Seed sectors (fixed list from CONTRACT.md Section 3)
        List<String> sectorNames = List.of("Banking", "Energy", "Manufacturing", "Tech", "Agriculture");
        sectorNames.forEach(name -> {
            MarketSector s = new MarketSector();
            s.setName(name);
            sectorRepo.save(s);
        });

        // Seed a few exposure links so the heatmap endpoint has real data
        Country india = countryRepo.findByIsoCode("IN").orElseThrow();
        Country us = countryRepo.findByIsoCode("US").orElseThrow();
        Country china = countryRepo.findByIsoCode("CN").orElseThrow();

        MarketSector banking = sectorRepo.findByName("Banking").orElseThrow();
        MarketSector energy = sectorRepo.findByName("Energy").orElseThrow();
        MarketSector manufacturing = sectorRepo.findByName("Manufacturing").orElseThrow();

        exposureRepo.save(buildLink(india, banking, 72.5));
        exposureRepo.save(buildLink(india, energy, 41.0));
        exposureRepo.save(buildLink(china, manufacturing, 88.2));
        exposureRepo.save(buildLink(us, banking, 55.0));

        System.out.println("Seed data inserted: 3 countries, 5 sectors, 4 exposure links.");

        // Seed holdings for Portfolio Exposure feature (v2)
        if (holdingRepo.count() == 0) {
            holdingRepo.save(buildHolding("RELIANCE", "Reliance Industries", "Energy", "IN", 18.0));
            holdingRepo.save(buildHolding("TCS", "Tata Consultancy Services", "Tech", "IN", 12.5));
            holdingRepo.save(buildHolding("HDFCBANK", "HDFC Bank", "Banking", "IN", 15.0));
            holdingRepo.save(buildHolding("APPLE", "Apple Inc.", "Tech", "US", 10.0));
            holdingRepo.save(buildHolding("SINOPEC", "China Petrochemical", "Energy", "CN", 8.0));
            System.out.println("Seed data inserted: 5 holdings.");
        }
    }

    private ExposureLink buildLink(Country country, MarketSector sector, double score) {
        ExposureLink link = new ExposureLink();
        link.setCountry(country);
        link.setSector(sector);
        link.setExposureScore(score);
        return link;
    }

    private Holding buildHolding(String ticker, String name, String sector, String region, double exposurePct) {
        Holding h = new Holding();
        h.setTicker(ticker);
        h.setName(name);
        h.setSector(sector);
        h.setRegion(region);
        h.setExposurePct(exposurePct);
        return h;
    }
}