package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BillRequestDto {
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
