package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseItemResponseDto {
    private Long id;
    private String particular;
    private Integer quantity;
    private Double rate;
    private Double amount;
}

