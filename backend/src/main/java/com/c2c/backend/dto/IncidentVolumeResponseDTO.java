package com.c2c.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class IncidentVolumeResponseDTO {
    private List<IncidentVolumeDayDTO> days;
}