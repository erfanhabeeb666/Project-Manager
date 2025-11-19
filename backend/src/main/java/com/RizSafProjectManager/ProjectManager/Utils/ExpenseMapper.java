package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.ExpenseRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ExpenseResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.Expense;

public interface ExpenseMapper {
    ExpenseResponseDto toDto(Expense expense);
    Expense toEntity(ExpenseRequestDto dto);
}

