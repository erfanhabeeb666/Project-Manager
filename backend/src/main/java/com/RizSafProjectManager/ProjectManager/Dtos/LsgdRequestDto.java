package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.LsgdType;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LsgdRequestDto {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private LsgdType type;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Block is required")
    private String block;

    private Integer wardCount;

    private Status status = Status.ACTIVE;
}
