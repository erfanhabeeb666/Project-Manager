package com.RizSafProjectManager.ProjectManager.Dtos;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectResponseDto {
    private Long id;
    private String code;
    private String name;
    private String lsgdName;
    private String workType;
    private BigDecimal sanctionedAmount;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private LocalDate actualEndDate;
    private String stage;
    private String createdById;
    private Instant createdAt;
    private List<ProjectActionDto> actions;
}
