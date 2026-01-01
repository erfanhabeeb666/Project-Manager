package com.RizSafProjectManager.ProjectManager.Controllers;

import com.RizSafProjectManager.ProjectManager.Dtos.BillRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.BillResponseDto;
import com.RizSafProjectManager.ProjectManager.Enums.Company;
import com.RizSafProjectManager.ProjectManager.Models.Bill;
import com.RizSafProjectManager.ProjectManager.Services.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('OFFICE_STAFF')")
    public ResponseEntity<BillResponseDto> generateBill(@RequestBody BillRequestDto request) {
        BillResponseDto response = billService.generateBill(request);
        response.setPdfUrl("/api/billing/" + response.getCompany().name() + "/" + response.getInvoiceNumber() + "/pdf");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyAuthority('OFFICE_STAFF', 'ADMIN')")
    public ResponseEntity<Page<BillResponseDto>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Company company) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<BillResponseDto> bills = billService.getAllBills(search, company, pageable);
        bills.forEach(b -> b.setPdfUrl("/api/billing/" + b.getCompany().name() + "/" + b.getInvoiceNumber() + "/pdf"));
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/companies")
    @PreAuthorize("hasAnyAuthority('OFFICE_STAFF', 'ADMIN')")
    public ResponseEntity<Company[]> getCompanies() {
        return ResponseEntity.ok(Company.values());
    }

    @GetMapping("/{company}/{invoiceNumber}/pdf")
    public ResponseEntity<Resource> downloadPdf(
            @PathVariable Company company,
            @PathVariable String invoiceNumber) {
        Bill bill = billService.findByCompanyAndInvoiceNumber(company, invoiceNumber);

        try {
            // pdfPath is like "/generated_bills/Invoice_00067.pdf"
            // We need to strip the leading slash if we are joining with current dir or
            // handle it appropriately
            String relativePath = bill.getPdfPath();
            if (relativePath.startsWith("/")) {
                relativePath = relativePath.substring(1);
            }

            Path filePath = Paths.get(relativePath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"Invoice_" + invoiceNumber + ".pdf\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read the file: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
}
