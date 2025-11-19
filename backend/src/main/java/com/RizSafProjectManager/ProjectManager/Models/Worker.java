package com.RizSafProjectManager.ProjectManager.Models;

import com.RizSafProjectManager.ProjectManager.Enums.Status;
import jakarta.persistence.*;

@Entity
public class Worker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String adharUid;
    private String mobileNumber;
    @Enumerated(value = EnumType.STRING)
    private Status status;

}
