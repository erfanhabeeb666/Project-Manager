package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.ExpenseType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequestDto {
    @NotNull(message = "Expense type is required")
    private ExpenseType type;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private LocalDate date;

    private String description;

    @Valid
    private List<ExpenseItemRequestDto> items;

    private List<Long> workerIds;
}

