package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PagedIncidentResponseDTO {
    private List<IncidentResponseDTO> content;
    private int page;
    private int size;
    private long totalElements;
}