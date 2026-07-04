package com.c2c.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "countries")
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 2)
    private String isoCode; // e.g. "IN", "US" — matches CONTRACT.md region field

    @Column(nullable = false)
    private String name; // e.g. "India"
}