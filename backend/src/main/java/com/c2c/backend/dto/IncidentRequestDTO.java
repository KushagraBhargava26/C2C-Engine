package com.c2c.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncidentRequestDTO {

    @NotBlank(message = "incidentText must not be blank")
    private String incidentText;

    @NotBlank(message = "sourceRegion must not be blank")
    private String sourceRegion;
}