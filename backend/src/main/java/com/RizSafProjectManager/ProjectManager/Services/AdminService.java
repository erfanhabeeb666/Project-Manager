package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.DashboardStatsDto;
import com.RizSafProjectManager.ProjectManager.Dtos.OfficeStaffDTO;
import com.RizSafProjectManager.ProjectManager.Enums.ActionStatus;
import com.RizSafProjectManager.ProjectManager.Enums.ActionType;
import com.RizSafProjectManager.ProjectManager.Enums.ExpenseType;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import com.RizSafProjectManager.ProjectManager.Enums.UserType;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import com.RizSafProjectManager.ProjectManager.Models.Worker;
import com.RizSafProjectManager.ProjectManager.Repos.ExpenseRepository;
import com.RizSafProjectManager.ProjectManager.Repos.OfficeStaffRepository;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectActionRepository;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectRepository;
import com.RizSafProjectManager.ProjectManager.Repos.WorkerRepository;
import com.RizSafProjectManager.ProjectManager.Utils.ConvertToDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final PasswordEncoder passwordEncoder;
    private final OfficeStaffRepository officeStaffRepository;
    private final WorkerRepository workerRepository;
    private final ProjectRepository projectRepository;
    private final ProjectActionRepository actionRepository;
    private final ExpenseRepository expenseRepository;

    public AdminService(PasswordEncoder passwordEncoder, OfficeStaffRepository officeStaffRepository, 
                       WorkerRepository workerRepository, ProjectRepository projectRepository,
                       ProjectActionRepository actionRepository, ExpenseRepository expenseRepository) {
        this.passwordEncoder = passwordEncoder;
        this.officeStaffRepository = officeStaffRepository;
        this.workerRepository = workerRepository;
        this.projectRepository = projectRepository;
        this.actionRepository = actionRepository;
        this.expenseRepository = expenseRepository;
    }

    public ResponseEntity<String> addOfficeStaff(OfficeStaff officeStaff) {
        officeStaff.setUserType(UserType.OFFICE_STAFF);
        officeStaff.setStatus(Status.ACTIVE);
        officeStaff.setPassword(passwordEncoder.encode(officeStaff.getPassword()));
        officeStaffRepository.save(officeStaff);
        return ResponseEntity
                .ok("office staff added");
    }

    public ResponseEntity<List<OfficeStaffDTO>> listAllStaffs() {
        List<OfficeStaffDTO> staffs = officeStaffRepository.findAll()
                .stream()
                .map(ConvertToDto::toOfficeStaffDto)
                .toList();
        return ResponseEntity.ok(staffs);
    }

    public ResponseEntity<String> addWorker(Worker worker) {
        worker.setStatus(Status.ACTIVE);
        workerRepository.save(worker);
        return ResponseEntity.ok("Worker Added Successfully");
    }

    public ResponseEntity<List<Worker>> listAllWorkers() {
        List<Worker> workers = workerRepository.findAll();
        return ResponseEntity.ok(workers);
    }

    public DashboardStatsDto getDashboardStats() {
        long totalProjects = projectRepository.count();
        long totalOfficeStaff = officeStaffRepository.count();
        long totalWorkers = workerRepository.count();
        
        var allActions = actionRepository.findAll();
        long totalActions = allActions.stream()
                .filter(a -> a.getActionType() != ActionType.STAGE_CHANGE)
                .count();
        long pendingActions = allActions.stream()
                .filter(a -> a.getActionType() != ActionType.STAGE_CHANGE && 
                            a.getStatus() == ActionStatus.PENDING)
                .count();
        long completedActions = allActions.stream()
                .filter(a -> a.getActionType() != ActionType.STAGE_CHANGE && 
                            a.getStatus() == ActionStatus.COMPLETED)
                .count();
        
        var allProjects = projectRepository.findAll();
        double totalExpenses = allProjects.stream()
                .mapToDouble(p -> p.getTotalExpense() != null ? p.getTotalExpense() : 0.0)
                .sum();
        
        double totalSanctionedAmount = allProjects.stream()
                .mapToDouble(p -> p.getSanctionedAmount() != null ? 
                        p.getSanctionedAmount().doubleValue() : 0.0)
                .sum();
        
        Map<String, Long> projectsByStage = allProjects.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getStage() != null ? p.getStage().name() : "UNKNOWN",
                        Collectors.counting()
                ));
        
        Map<String, Long> projectsByWorkType = allProjects.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getWorkType() != null ? p.getWorkType().name() : "UNKNOWN",
                        Collectors.counting()
                ));
        
        var allExpenses = expenseRepository.findAll();
        long totalExpensesCount = allExpenses.size();
        long visitExpensesCount = allExpenses.stream()
                .filter(e -> e.getType() == ExpenseType.VISIT)
                .count();
        long materialExpensesCount = allExpenses.stream()
                .filter(e -> e.getType() == ExpenseType.MATERIAL)
                .count();
        
        return DashboardStatsDto.builder()
                .totalProjects(totalProjects)
                .totalOfficeStaff(totalOfficeStaff)
                .totalWorkers(totalWorkers)
                .totalActions(totalActions)
                .pendingActions(pendingActions)
                .completedActions(completedActions)
                .totalExpenses(totalExpenses)
                .totalSanctionedAmount(totalSanctionedAmount)
                .projectsByStage(projectsByStage)
                .projectsByWorkType(projectsByWorkType)
                .totalExpensesCount(totalExpensesCount)
                .visitExpensesCount(visitExpensesCount)
                .materialExpensesCount(materialExpensesCount)
                .build();
    }
}
