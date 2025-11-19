package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.*;
import com.RizSafProjectManager.ProjectManager.Models.*;

import java.util.List;
import java.util.stream.Collectors;

public class ConvertToDto {

    /* -------------------------------------------
       OFFICE STAFF
     --------------------------------------------*/
    public static OfficeStaffDTO toOfficeStaffDto(OfficeStaff officeStaff) {
        if (officeStaff == null) return null;

        OfficeStaffDTO dto = new OfficeStaffDTO();
        dto.setId(officeStaff.getId());
        dto.setName(officeStaff.getName());
        dto.setEmail(officeStaff.getEmail());
        dto.setMobileNumber(officeStaff.getMobileNumber());
        dto.setAdharUid(officeStaff.getAdharUid());
        return dto;
    }

}
