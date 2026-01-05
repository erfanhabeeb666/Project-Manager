package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteLocationRequestDto {
    private String name;
    private String address;
    private String googleMapLink;
    private String latitude;
    private String longitude;
}
