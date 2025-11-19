package com.RizSafProjectManager.ProjectManager.Dtos;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectRequestDto {
    @Size(max = 100)
    private String code;

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String lsgdName;

    @Size(max = 100)
    private String workType;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal sanctionedAmount;

    private LocalDate startDate;
    private LocalDate expectedEndDate;
}
