package com.RizSafProjectManager.ProjectManager.Dtos;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChangeStageRequestDto {
    @NotBlank
    private String stage;
    private String notes;
}