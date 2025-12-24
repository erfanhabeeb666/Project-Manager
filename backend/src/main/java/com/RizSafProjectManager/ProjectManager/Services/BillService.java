package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.BillRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.BillResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.Bill;
import com.RizSafProjectManager.ProjectManager.Repos.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final AmountInWordsService amountInWordsService;
    private final BillPdfService billPdfService;

    @Transactional

    public BillResponseDto generateBill(BillRequestDto request) {
        Bill bill = new Bill();
        bill.setCustomerName(request.getCustomerName());
        bill.setCustomerAddress(request.getCustomerAddress());
        bill.setInvoiceDate(LocalDate.now());

        BigDecimal totalTaxableValue = BigDecimal.ZERO;

        for (BillRequestDto.BillItemDto itemDto : request.getItems()) {
            com.RizSafProjectManager.ProjectManager.Models.BillItem item = new com.RizSafProjectManager.ProjectManager.Models.BillItem();
            item.setDescription(itemDto.getDescription());
            item.setQuantity(itemDto.getQuantity());
            item.setRate(itemDto.getRate());

            BigDecimal itemTotal = itemDto.getRate().multiply(new BigDecimal(itemDto.getQuantity()));
            itemTotal = itemTotal.setScale(2, RoundingMode.HALF_UP);
            item.setAmount(itemTotal);

            bill.getItems().add(item);
            totalTaxableValue = totalTaxableValue.add(itemTotal);
        }

        // Tax acts on total taxable value
        // SGST = 9%, CGST = 9%
        BigDecimal sgst = totalTaxableValue.multiply(new BigDecimal("0.09")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal cgst = totalTaxableValue.multiply(new BigDecimal("0.09")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalWithTax = totalTaxableValue.add(sgst).add(cgst);

        // Round Off Logic
        // Round to nearest rupee
        BigDecimal grandTotal = totalWithTax.setScale(0, RoundingMode.HALF_UP);
        BigDecimal roundOff = grandTotal.subtract(totalWithTax);

        bill.setTaxableValue(totalTaxableValue);
        bill.setSgstAmount(sgst);
        bill.setCgstAmount(cgst);
        bill.setTotalAmount(totalWithTax);
        bill.setGrandTotal(grandTotal.setScale(2, RoundingMode.HALF_UP));
        bill.setRoundOff(roundOff);

        // Amount in Word
        bill.setAmountInWords(amountInWordsService.convertToIndianCurrency(grandTotal.longValue()));

        // Invoice Number
        bill.setInvoiceNumber(generateNextInvoiceNumber());

        // 3. Save initial state
        bill = billRepository.save(bill);

        // 4. Generate PDF
        try {
            String pdfPath = billPdfService.generatePdf(bill);
            bill.setPdfPath(pdfPath);
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        // Save again with PDF Path
        billRepository.save(bill);

        return mapToDto(bill);
    }

    public Page<BillResponseDto> getAllBills(String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return billRepository.findByInvoiceNumberContainingIgnoreCase(search, pageable).map(this::mapToDto);
        }
        return billRepository.findAll(pageable).map(this::mapToDto);
    }

    private BillResponseDto mapToDto(Bill bill) {
        BillResponseDto response = new BillResponseDto();
        response.setId(bill.getId());
        response.setInvoiceNumber(bill.getInvoiceNumber());
        response.setInvoiceDate(bill.getInvoiceDate());
        response.setCustomerName(bill.getCustomerName());
        response.setGrandTotal(bill.getGrandTotal());
        response.setPdfUrl(bill.getPdfPath());
        return response;
    }

    private synchronized String generateNextInvoiceNumber() {
        String lastInvoice = billRepository.findLastInvoiceNumber();
        if (lastInvoice == null) {
            return "00001";
        }
        try {
            int nextId = Integer.parseInt(lastInvoice) + 1;
            return String.format("%05d", nextId);
        } catch (NumberFormatException e) {
            // Fallback if sequence is broken or format changes
            return "00001";
        }
    }
}
