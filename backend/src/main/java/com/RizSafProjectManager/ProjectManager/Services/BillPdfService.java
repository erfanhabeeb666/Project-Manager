package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Enums.Company;
import com.RizSafProjectManager.ProjectManager.Models.Bill;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class BillPdfService {

    private final String PDF_DIR = "generated_bills/";

    public String generatePdf(Bill bill) throws DocumentException, IOException {
        Path uploadPath = Paths.get(PDF_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Include company prefix in filename to avoid conflicts
        String companyPrefix = bill.getCompany() == Company.RIZSAF_PVT_LTD ? "RPL_" : "RLS_";
        String fileName = "Invoice_" + companyPrefix + bill.getInvoiceNumber() + ".pdf";
        String filePath = PDF_DIR + fileName;

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, new FileOutputStream(filePath));

        document.open();

        addHeader(document, bill.getCompany());
        addTitle(document, "GST TAX INVOICE");
        addBillDetails(document, bill);
        addItemsTable(document, bill);
        addBankDetailsAndSign(document, bill);

        document.close();

        return "/generated_bills/" + fileName;
    }

    private void addHeader(Document document, Company company) throws DocumentException {
        // Colors
        BaseColor companyColor = BaseColor.BLUE;
        BaseColor detailsColor = new BaseColor(0, 0, 139); // Dark Blue

        Font companyFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 16, companyColor);
        Font subheaderFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10);
        Font detailsFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10, detailsColor);

        Paragraph companyName = new Paragraph(company.getCompanyName(), companyFont);
        companyName.setAlignment(Element.ALIGN_CENTER);
        document.add(companyName);

        // Add subheader only if it exists for this company
        if (company.getSubHeader() != null && !company.getSubHeader().isEmpty()) {
            Paragraph subheader = new Paragraph(company.getSubHeader(), subheaderFont);
            subheader.setAlignment(Element.ALIGN_CENTER);
            document.add(subheader);
        }

        // Build details string dynamically
        StringBuilder detailsBuilder = new StringBuilder();
        detailsBuilder.append(company.getAddress()).append("\n");

        if (company.getMsmeNo() != null && !company.getMsmeNo().isEmpty()) {
            detailsBuilder.append("MSME No: ").append(company.getMsmeNo()).append("\n");
        }
        if (company.getElectricalLicenseNo() != null && !company.getElectricalLicenseNo().isEmpty()) {
            detailsBuilder.append("Electrical Contract License No: ").append(company.getElectricalLicenseNo())
                    .append("\n");
        }
        if (company.getPwdRegistrationNo() != null && !company.getPwdRegistrationNo().isEmpty()) {
            detailsBuilder.append("PWD Registration No: ").append(company.getPwdRegistrationNo()).append("\n");
        }

        detailsBuilder.append("GSTN: ").append(company.getGstn()).append("\n");

        if (company.getPhone() != null && !company.getPhone().isEmpty()) {
            detailsBuilder.append("Phone: ").append(company.getPhone()).append(", ");
        }
        detailsBuilder.append("Mobile: ").append(company.getMobile()).append("\n");
        detailsBuilder.append("E-Mail: ").append(company.getEmail());

        Paragraph details = new Paragraph(detailsBuilder.toString(), detailsFont);
        details.setAlignment(Element.ALIGN_CENTER);
        details.setSpacingAfter(10);
        document.add(details);

        // Horizontal Line
        document.add(new Paragraph(" "));
        org.springframework.util.Assert.notNull(document, "Document must not be null");
        // We can add a line separator but standard paragraph spacing might be enough
    }

    private void addTitle(Document document, String titleText) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 12, Font.UNDERLINE);
        Paragraph title = new Paragraph(titleText, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);
    }

    private void addBillDetails(Document document, Bill bill) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 1, 1 });
        table.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        Font labelFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 10);
        Font valueFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10);

        // Left Side: Customer Details
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.addElement(new Paragraph("Name & Address of Receiving Customer:", labelFont));
        leftCell.addElement(new Paragraph(bill.getCustomerName(), valueFont));
        leftCell.addElement(new Paragraph(bill.getCustomerAddress(), valueFont));
        table.addCell(leftCell);

        // Right Side: Invoice Details
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        PdfPTable innerTable = new PdfPTable(2);
        innerTable.setWidthPercentage(100);
        innerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        innerTable.addCell(new Paragraph("Invoice No:", labelFont));
        innerTable.addCell(new Paragraph(bill.getInvoiceNumber(), valueFont));

        innerTable.addCell(new Paragraph("Date:", labelFont));
        innerTable.addCell(
                new Paragraph(bill.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), valueFont));

        rightCell.addElement(innerTable);
        table.addCell(rightCell);

        table.setSpacingAfter(10);
        document.add(table);
    }

    private void addItemsTable(Document document, Bill bill) throws DocumentException {
        PdfPTable table = new PdfPTable(9); // Sl No, Desc, Qty, Rate, Taxable, GST Rate, SGST, CGST, Total
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 1, 4, 1, 2, 2, 1.5f, 2, 2, 2.5f });

        addTableHeader(table, "Sl No", "Item Description", "Qty", "Rate", "Taxable Value", "GST Rate", "SGST 9%",
                "CGST 9%", "Total");

        int slNo = 1;
        for (com.RizSafProjectManager.ProjectManager.Models.BillItem item : bill.getItems()) {
            addTableCell(table, String.valueOf(slNo++));
            addTableCell(table, item.getDescription());
            addTableCell(table, String.valueOf(item.getQuantity()));
            addTableCell(table, String.format("%.2f", item.getRate()));

            // Per item taxable value is quantity * rate
            BigDecimal taxable = item.getRate().multiply(new BigDecimal(item.getQuantity()));
            addTableCell(table, String.format("%.2f", taxable));

            addTableCell(table, "18%");

            // Per item tax share (approximate for display)
            BigDecimal sgst = taxable.multiply(new BigDecimal("0.09"));
            BigDecimal cgst = taxable.multiply(new BigDecimal("0.09"));
            BigDecimal total = taxable.add(sgst).add(cgst);

            addTableCell(table, String.format("%.2f", sgst));
            addTableCell(table, String.format("%.2f", cgst));
            addTableCell(table, String.format("%.2f", total));
        }

        // Totals Row
        PdfPCell totalLabelCell = new PdfPCell(
                new Phrase("Grand Total", FontFactory.getFont(FontFactory.TIMES_BOLD, 9)));
        totalLabelCell.setColspan(8);
        totalLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalLabelCell.setPadding(5);
        table.addCell(totalLabelCell);

        PdfPCell totalValueCell = new PdfPCell(new Phrase(String.format("%.2f", bill.getGrandTotal()),
                FontFactory.getFont(FontFactory.TIMES_BOLD, 9)));
        totalValueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalValueCell.setPadding(5);
        table.addCell(totalValueCell);

        table.setSpacingAfter(10);
        document.add(table);

        // Round Off Display (Separate or under table)
        PdfPTable roundOffTable = new PdfPTable(2);
        roundOffTable.setWidthPercentage(100);
        roundOffTable.setWidths(new float[] { 8, 2 }); // Align with table somewhat

        PdfPCell roundOffLabel = new PdfPCell(
                new Phrase("Round Off:", FontFactory.getFont(FontFactory.TIMES_ROMAN, 9)));
        roundOffLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        roundOffLabel.setBorder(Rectangle.NO_BORDER);
        roundOffTable.addCell(roundOffLabel);

        PdfPCell roundOffValue = new PdfPCell(
                new Phrase(String.format("%.2f", bill.getRoundOff()), FontFactory.getFont(FontFactory.TIMES_ROMAN, 9)));
        roundOffValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        roundOffValue.setBorder(Rectangle.NO_BORDER);
        roundOffTable.addCell(roundOffValue);

        document.add(roundOffTable);
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        Font font = FontFactory.getFont(FontFactory.TIMES_BOLD, 9);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, font));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String text) {
        Font font = FontFactory.getFont(FontFactory.TIMES_ROMAN, 9);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addBankDetailsAndSign(Document document, Bill bill) throws DocumentException {
        Company company = bill.getCompany();

        // Amount in Words
        Font boldFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 10);
        Font normalFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10);

        Paragraph amountInWords = new Paragraph("Amount in Words: " + bill.getAmountInWords(), boldFont);
        amountInWords.setSpacingBefore(10);
        amountInWords.setSpacingAfter(20);
        document.add(amountInWords);

        // Bank Details
        PdfPTable bankTable = new PdfPTable(2);
        bankTable.setWidthPercentage(100);
        bankTable.setWidths(new float[] { 1, 1 });
        bankTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        PdfPCell bankCell = new PdfPCell();
        bankCell.setBorder(Rectangle.NO_BORDER);
        bankCell.addElement(new Paragraph("Bank Details:", boldFont));
        bankCell.addElement(new Paragraph("Bank: " + company.getBankName(), normalFont));
        bankCell.addElement(new Paragraph("Branch: " + company.getBankBranch(), normalFont));
        bankCell.addElement(new Paragraph("A/C No: " + company.getAccountNo(), normalFont));
        bankCell.addElement(new Paragraph("IFSC Code: " + company.getIfscCode(), normalFont));
        bankTable.addCell(bankCell);

        PdfPCell signCell = new PdfPCell();
        signCell.setBorder(Rectangle.NO_BORDER);
        signCell.setVerticalAlignment(Element.ALIGN_BOTTOM);

        Paragraph forCompany = new Paragraph("\n\nFor " + company.getCompanyName(), boldFont);
        forCompany.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(forCompany);

        try {
            // Load signature image
            Image signature = Image.getInstance("sign.png");
            signature.scaleToFit(100, 50);
            signature.setAlignment(Element.ALIGN_RIGHT);
            signCell.addElement(signature);
        } catch (Exception e) {
            // If image fails, just add spacing
            Paragraph spacing = new Paragraph("\n\n\n");
            spacing.setAlignment(Element.ALIGN_RIGHT);
            signCell.addElement(spacing);
        }

        Paragraph authSignatory = new Paragraph("Authorized Signatory", boldFont);
        authSignatory.setAlignment(Element.ALIGN_RIGHT);
        signCell.addElement(authSignatory);

        bankTable.addCell(signCell);

        document.add(bankTable);
    }
}
