package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.OfficeStaffDTO;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;

public class ConvertToDto {

    public static OfficeStaffDTO convertToOfficeStaffDto(OfficeStaff officeStaff) {
        OfficeStaffDTO dto = new OfficeStaffDTO();
        dto.setId(officeStaff.getId());
        dto.setName(officeStaff.getName());
        dto.setEmail(officeStaff.getEmail());
        dto.setMobileNumber(officeStaff.getMobileNumber());
        dto.setAdharUid(officeStaff.getAdharUid());
        return dto;
    }
}
