package com.c2c.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "market_sectors")
public class MarketSector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Banking, Energy, Manufacturing, Tech, Agriculture — fixed list from CONTRACT.md
}