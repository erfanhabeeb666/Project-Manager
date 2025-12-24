package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BillResponseDto {
    private Long id;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private String customerName;
    private BigDecimal grandTotal;
    private String pdfUrl;
}
