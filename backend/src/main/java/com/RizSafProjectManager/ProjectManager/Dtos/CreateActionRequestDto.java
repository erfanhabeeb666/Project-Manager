package com.RizSafProjectManager.ProjectManager.Dtos;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateActionRequestDto {
    @NotBlank
    @Size(max = 255)
    private String title;

    @NotNull
    private LocalDate actionDate;

    @Size(max = 2000)
    private String notes;
}