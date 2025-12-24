package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.LsgdType;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LsgdResponseDto {
    private UUID id;
    private String name;
    private LsgdType type;
    private String district;
    private String block;
    private Integer wardCount;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
