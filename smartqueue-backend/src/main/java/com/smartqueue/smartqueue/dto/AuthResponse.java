package com.smartqueue.smartqueue.dto;


import lombok.*;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private String name;
    private Long userId;
}

