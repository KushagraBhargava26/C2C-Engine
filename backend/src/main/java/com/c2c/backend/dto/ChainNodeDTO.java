package com.c2c.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChainNodeDTO {
    private String node;
    private String type; // EVENT, MARKET_SIGNAL, HOLDING
    private Double impactPct; // only present on the last node
}