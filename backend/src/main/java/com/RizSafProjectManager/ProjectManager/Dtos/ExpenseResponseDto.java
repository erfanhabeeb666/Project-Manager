package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.ExpenseType;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponseDto {
    private Long id;
    private ExpenseType type;
    private Long projectId;
    private LocalDate date;
    private String description;
    private Double totalAmount;
    private List<ExpenseItemResponseDto> items;
    private List<WorkerResponseDto> workers;
    private String createdByName;
    private LocalDateTime createdAt;
}

