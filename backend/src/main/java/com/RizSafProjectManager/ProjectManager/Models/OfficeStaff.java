package com.RizSafProjectManager.ProjectManager.Models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("OFFICE_STAFF")
@Getter
@Setter
public class OfficeStaff extends User{
    private String mobileNumber;
    private String adharUid;
}
