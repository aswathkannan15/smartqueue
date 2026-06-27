package com.smartqueue.smartqueue.dto;



import com.smartqueue.smartqueue.entity.User;
import jakarta.validation.constraints.*;
        import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

    private User.Role role = User.Role.CUSTOMER;

    private Long counterId;
}