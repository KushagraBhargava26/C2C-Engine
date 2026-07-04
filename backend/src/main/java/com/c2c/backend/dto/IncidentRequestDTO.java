package com.c2c.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncidentRequestDTO {

    @NotBlank(message = "incidentText must not be blank")
    private String incidentText;

    @NotBlank(message = "sourceRegion must not be blank")
    @Size(min = 2, max = 2, message = "sourceRegion must be a 2-letter ISO code")
    private String sourceRegion;
}