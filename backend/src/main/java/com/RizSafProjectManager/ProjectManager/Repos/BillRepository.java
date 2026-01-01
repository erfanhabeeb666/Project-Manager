package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Enums.Company;
import com.RizSafProjectManager.ProjectManager.Models.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByCompanyAndInvoiceNumber(Company company, String invoiceNumber);

    @Query("SELECT MAX(b.invoiceNumber) FROM Bill b WHERE b.company = :company")
    String findLastInvoiceNumberByCompany(@Param("company") Company company);

    Page<Bill> findByInvoiceNumberContainingIgnoreCase(String invoiceNumber, Pageable pageable);

    Page<Bill> findByCompany(Company company, Pageable pageable);

    Page<Bill> findByCompanyAndInvoiceNumberContainingIgnoreCase(Company company, String invoiceNumber,
            Pageable pageable);
}
