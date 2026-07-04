package com.c2c.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "exposure_links")
public class ExposureLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @ManyToOne
    @JoinColumn(name = "sector_id", nullable = false)
    private MarketSector sector;

    @Column(nullable = false)
    private Double exposureScore; // 0-100, matches CONTRACT.md
}