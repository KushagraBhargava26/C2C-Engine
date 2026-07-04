package com.c2c.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "holdings")
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ticker; // e.g. "RELIANCE"

    @Column(nullable = false)
    private String name; // e.g. "Reliance Industries"

    @Column(nullable = false)
    private String sector; // matches fixed sector list from CONTRACT.md

    @Column(nullable = false, length = 2)
    private String region; // ISO alpha-2

    @Column(nullable = false)
    private Double exposurePct; // 0-100
}