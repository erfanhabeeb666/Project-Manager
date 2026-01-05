package com.RizSafProjectManager.ProjectManager.Models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "google_map_link", columnDefinition = "TEXT")
    private String googleMapLink;
    private String latitude;
    private String longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}
