package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.*;
import com.RizSafProjectManager.ProjectManager.Models.Expense;
import com.RizSafProjectManager.ProjectManager.Models.ExpenseItem;
import com.RizSafProjectManager.ProjectManager.Models.Worker;
import com.RizSafProjectManager.ProjectManager.Repos.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseMapperImpl implements ExpenseMapper {
    private final WorkerRepository workerRepository;

    public ExpenseMapperImpl(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    @Override
    public ExpenseResponseDto toDto(Expense expense) {
        if (expense == null)
            return null;

        return ExpenseResponseDto.builder()
                .id(expense.getId())
                .type(expense.getType())
                .projectId(expense.getProject() != null ? expense.getProject().getId() : null)
                .date(expense.getDate())
                .description(expense.getDescription())
                .totalAmount(expense.getTotalAmount())
                .items(itemsToDtoList(expense.getItems()))
                .workers(workersToDtoList(expense.getWorkers()))
                .createdByName(expense.getCreatedBy() != null ? expense.getCreatedBy().getName() : null)
                .createdAt(expense.getCreatedAt())
                .build();
    }

    @Override
    public Expense toEntity(ExpenseRequestDto dto) {
        if (dto == null)
            return null;

        Expense expense = new Expense();
        expense.setType(dto.getType());
        expense.setDate(dto.getDate());
        expense.setDescription(dto.getDescription());

        // Map items and calculate amounts
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            List<ExpenseItem> items = dto.getItems().stream()
                    .map(itemDto -> {
                        ExpenseItem item = new ExpenseItem();
                        item.setParticular(itemDto.getParticular());
                        item.setQuantity(itemDto.getQuantity());
                        item.setRate(itemDto.getRate());
                        
                        // Auto-calculate: item.amount = quantity * rate
                        if (itemDto.getQuantity() != null && itemDto.getRate() != null) {
                            item.setAmount(itemDto.getQuantity() * itemDto.getRate());
                        } else {
                            item.setAmount(0.0);
                        }
                        
                        item.setExpense(expense);
                        return item;
                    })
                    .collect(Collectors.toList());
            
            expense.setItems(items);
            
            // Auto-calculate: expense.totalAmount = sum(item.amount)
            double total = items.stream()
                    .mapToDouble(item -> item.getAmount() != null ? item.getAmount() : 0.0)
                    .sum();
            expense.setTotalAmount(total);
        } else {
            expense.setTotalAmount(0.0);
        }

        // Map workers if provided (only for VISIT type, but we'll allow it for any type)
        if (dto.getWorkerIds() != null && !dto.getWorkerIds().isEmpty()) {
            List<Worker> workers = workerRepository.findAllById(dto.getWorkerIds());
            expense.setWorkers(workers);
        }

        return expense;
    }

    private List<ExpenseItemResponseDto> itemsToDtoList(List<ExpenseItem> items) {
        if (items == null || items.isEmpty())
            return Collections.emptyList();
        
        return items.stream()
                .map(this::itemToDto)
                .collect(Collectors.toList());
    }

    private ExpenseItemResponseDto itemToDto(ExpenseItem item) {
        if (item == null)
            return null;

        return ExpenseItemResponseDto.builder()
                .id(item.getId())
                .particular(item.getParticular())
                .quantity(item.getQuantity())
                .rate(item.getRate())
                .amount(item.getAmount())
                .build();
    }

    private List<WorkerResponseDto> workersToDtoList(List<Worker> workers) {
        if (workers == null || workers.isEmpty())
            return Collections.emptyList();
        
        return workers.stream()
                .map(this::workerToDto)
                .collect(Collectors.toList());
    }

    private WorkerResponseDto workerToDto(Worker worker) {
        if (worker == null)
            return null;

        return WorkerResponseDto.builder()
                .id(worker.getId())
                .name(worker.getName())
                .adharUid(worker.getAdharUid())
                .mobileNumber(worker.getMobileNumber())
                .status(worker.getStatus())
                .build();
    }
}

