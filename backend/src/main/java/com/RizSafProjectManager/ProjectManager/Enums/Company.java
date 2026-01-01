package com.RizSafProjectManager.ProjectManager.Enums;

import lombok.Getter;

@Getter
public enum Company {
    RIZSAF_LIGHTING(
            "RIZ SAF LIGHTING SOLUTIONS",
            "(Approved by Department of Industries, Govt. of Kerala)",
            "Edavetty P O, Thodupuzha, Idukki District, Kerala, Pin – 685588",
            "KL03A0000320",
            "CB 6534",
            "ELD/KKD/C/20",
            "32BPNPS5199M3ZW",
            "04862 229227",
            "9747463027",
            "shajahanrassak@gmail.com",
            "State Bank of India",
            "Karikode, Thodupuzha",
            "67317760046",
            "SBIN0070886"),
    RIZSAF_PVT_LTD(
            "RIZSAF PRIVATE LIMITED",
            "",
            "Edavetty P O, Thodupuzha, Idukki District, Kerala, Pin – 685588",
            "",
            "",
            "",
            "32AANCR649401Z5",
            "",
            "9747463027",
            "rizsafpvtltd@gmail.com",
            "State Bank of India",
            "Karikode, Thodupuzha",
            "67317760046",
            "SBIN0070886");

    private final String companyName;
    private final String subHeader;
    private final String address;
    private final String msmeNo;
    private final String electricalLicenseNo;
    private final String pwdRegistrationNo;
    private final String gstn;
    private final String phone;
    private final String mobile;
    private final String email;
    private final String bankName;
    private final String bankBranch;
    private final String accountNo;
    private final String ifscCode;

    Company(String companyName, String subHeader, String address, String msmeNo,
            String electricalLicenseNo, String pwdRegistrationNo, String gstn,
            String phone, String mobile, String email, String bankName,
            String bankBranch, String accountNo, String ifscCode) {
        this.companyName = companyName;
        this.subHeader = subHeader;
        this.address = address;
        this.msmeNo = msmeNo;
        this.electricalLicenseNo = electricalLicenseNo;
        this.pwdRegistrationNo = pwdRegistrationNo;
        this.gstn = gstn;
        this.phone = phone;
        this.mobile = mobile;
        this.email = email;
        this.bankName = bankName;
        this.bankBranch = bankBranch;
        this.accountNo = accountNo;
        this.ifscCode = ifscCode;
    }
}
