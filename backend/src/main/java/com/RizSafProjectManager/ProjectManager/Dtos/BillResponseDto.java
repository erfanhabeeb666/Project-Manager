package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.Company;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BillResponseDto {
    private Long id;
    private Company company;
    private String companyName;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private String customerName;
    private BigDecimal grandTotal;
    private String pdfUrl;
}
