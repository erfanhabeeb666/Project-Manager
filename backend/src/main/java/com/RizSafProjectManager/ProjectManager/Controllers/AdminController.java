package com.RizSafProjectManager.ProjectManager.Controllers;

import com.RizSafProjectManager.ProjectManager.Dtos.OfficeStaffDTO;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import com.RizSafProjectManager.ProjectManager.Services.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/add-staff")
    public ResponseEntity<String> addOfficeStaff(@RequestBody  OfficeStaff officeStaff){
        return adminService.addOfficeStaff(officeStaff);
    }
    @GetMapping("/list-staff")
    public ResponseEntity<List<OfficeStaffDTO>> listAllOfficeStaff(){
        return adminService.listAllStaffs();
    }
}
