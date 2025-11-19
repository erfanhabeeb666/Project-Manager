package com.RizSafProjectManager.ProjectManager.Dtos;

import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseItemRequestDto {
    private String particular;

    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer quantity;

    @Min(value = 0, message = "Rate must be non-negative")
    private Double rate;
}

