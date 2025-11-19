package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.ExpenseRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ExpenseResponseDto;
import com.RizSafProjectManager.ProjectManager.Enums.ExpenseType;
import com.RizSafProjectManager.ProjectManager.Exception.NotFoundException;
import com.RizSafProjectManager.ProjectManager.Models.Expense;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import com.RizSafProjectManager.ProjectManager.Models.Project;
import com.RizSafProjectManager.ProjectManager.Repos.ExpenseRepository;
import com.RizSafProjectManager.ProjectManager.Repos.OfficeStaffRepository;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectRepository;
import com.RizSafProjectManager.ProjectManager.Utils.ExpenseMapperImpl;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ProjectRepository projectRepository;
    private final OfficeStaffRepository officeStaffRepository;
    private final ExpenseMapperImpl mapper;

    public ExpenseService(ExpenseRepository expenseRepository,
                         ProjectRepository projectRepository,
                         OfficeStaffRepository officeStaffRepository,
                         ExpenseMapperImpl mapper) {
        this.expenseRepository = expenseRepository;
        this.projectRepository = projectRepository;
        this.officeStaffRepository = officeStaffRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ExpenseResponseDto createExpense(ExpenseRequestDto dto, Long createdById) {
        // Validate project exists
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new NotFoundException("Project not found: " + dto.getProjectId()));

        // Get created by user
        OfficeStaff createdBy = officeStaffRepository.findById(createdById)
                .orElseThrow(() -> new NotFoundException("Staff user not found: " + createdById));

        // Map request → entity (mapper auto-calculates item amounts and total)
        Expense expense = mapper.toEntity(dto);
        expense.setProject(project);
        expense.setCreatedBy(createdBy);
        expense.setCreatedAt(LocalDateTime.now());

        // Save expense + items
        Expense saved = expenseRepository.save(expense);

        // Update project.totalExpense
        updateProjectTotalExpense(dto.getProjectId());

        return mapper.toDto(saved);
    }

    public Page<ExpenseResponseDto> listExpenses(Optional<Long> projectId, 
                                                 Optional<ExpenseType> type, 
                                                 Pageable pageable) {
        Page<Expense> page;
        
        if (projectId.isPresent() || type.isPresent()) {
            page = expenseRepository.findByProjectIdAndType(
                    projectId.orElse(null),
                    type.orElse(null),
                    pageable
            );
        } else {
            page = expenseRepository.findAll(pageable);
        }

        return page.map(mapper::toDto);
    }

    public ExpenseResponseDto getExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Expense not found: " + id));
        return mapper.toDto(expense);
    }

    @Transactional
    private void updateProjectTotalExpense(Long projectId) {
        var expenses = expenseRepository.findByProject_Id(projectId);
        double total = expenses.stream()
                .mapToDouble(e -> e.getTotalAmount() != null ? e.getTotalAmount() : 0.0)
                .sum();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        project.setTotalExpense(total);
        projectRepository.save(project);
    }
}

