package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.OfficeStaffDTO;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import com.RizSafProjectManager.ProjectManager.Enums.UserType;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import com.RizSafProjectManager.ProjectManager.Models.Worker;
import com.RizSafProjectManager.ProjectManager.Repos.OfficeStaffRepository;
import com.RizSafProjectManager.ProjectManager.Repos.WorkerRepository;
import com.RizSafProjectManager.ProjectManager.Utils.ConvertToDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    private final PasswordEncoder passwordEncoder;
    private final OfficeStaffRepository officeStaffRepository;
    private final WorkerRepository workerRepository;

    public AdminService(PasswordEncoder passwordEncoder, OfficeStaffRepository officeStaffRepository, WorkerRepository workerRepository) {
        this.passwordEncoder = passwordEncoder;
        this.officeStaffRepository = officeStaffRepository;
        this.workerRepository = workerRepository;
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
                .map(ConvertToDto::convertToOfficeStaffDto)
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
}
