package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
public class SentimentTimeseriesPointDTO {
    private Instant timestamp;
    private Double avgSentiment;
}