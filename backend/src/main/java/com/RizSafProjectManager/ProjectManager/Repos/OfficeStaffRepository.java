package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfficeStaffRepository extends JpaRepository<OfficeStaff,Long> {
    Optional<OfficeStaff> findByEmail(String email);
}
