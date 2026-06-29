package com.smartqueue.smartqueue.dto;


import com.smartqueue.smartqueue.entity.Token.Priority;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TokenRequest {
    @NotNull
    private Long counterId;
    private Priority priority = Priority.NORMAL;
}