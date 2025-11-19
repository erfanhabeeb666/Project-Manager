package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.OfficeStaffDTO;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import com.RizSafProjectManager.ProjectManager.Enums.UserType;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import com.RizSafProjectManager.ProjectManager.Repos.OfficeStaffRepository;
import com.RizSafProjectManager.ProjectManager.Utils.ConvertToDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    private final PasswordEncoder passwordEncoder;
    private final OfficeStaffRepository officeStaffRepository;

    public AdminService(PasswordEncoder passwordEncoder, OfficeStaffRepository officeStaffRepository) {
        this.passwordEncoder = passwordEncoder;
        this.officeStaffRepository = officeStaffRepository;
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
}
