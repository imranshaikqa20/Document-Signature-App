package com.signatureapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignRequest {

    @NotBlank(message = "Signature image is required")
    private String signatureImage;

    @JsonProperty("xPercent")
    @NotNull(message = "X position is required")
    private Double xPercent;

    @JsonProperty("yPercent")
    @NotNull(message = "Y position is required")
    private Double yPercent;

    @JsonProperty("widthPercent")
    @NotNull(message = "Width is required")
    private Double widthPercent;

    @JsonProperty("heightPercent")
    @NotNull(message = "Height is required")
    private Double heightPercent;

    @NotNull(message = "Page number is required")
    @Min(value = 1, message = "Page must be >= 1")
    private Integer page;
}
