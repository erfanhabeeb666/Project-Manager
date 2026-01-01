package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.Company;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BillRequestDto {
    private Company company;
    private String customerName;
    private String customerAddress;
    private java.util.List<BillItemDto> items;

    @Data
    public static class BillItemDto {
        private String description;
        private Integer quantity;
        private BigDecimal rate;
    }
}
