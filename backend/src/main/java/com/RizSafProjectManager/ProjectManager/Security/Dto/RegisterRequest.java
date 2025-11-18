package com.RizSafProjectManager.ProjectManager.Security.Dto;

import com.RizSafProjectManager.ProjectManager.Enums.UserType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 100, message = "Full name length must be less than or equal to 100 characters")
    private String fullName;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email length must be less than or equal to 100 characters")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 100, message = "Password length must be between 8 and 100 characters")
    private String password;

    @NotBlank(message = "Mobile number cannot be blank")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits long")
    private String mobileNumber;

    @NotNull(message = "User type cannot be null")
    private UserType userType;
}
