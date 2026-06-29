package com.smartqueue.smartqueue.service;



import com.smartqueue.smartqueue.dto.*;
        import com.smartqueue.smartqueue.entity.*;
        import com.smartqueue.smartqueue.repo.*;
        import com.smartqueue.smartqueue.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
        import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CounterRepository counterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Counter counter = null;
        if (request.getCounterId() != null) {
            counter = counterRepository.findById(request.getCounterId())
                    .orElseThrow(() -> new IllegalArgumentException("Counter not found"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .counter(counter)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        Long counterId = user.getCounter() != null ? user.getCounter().getId() : null;
        return new AuthResponse(token, user.getRole().name(), user.getName(), user.getId(), counterId);
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        Long counterId = user.getCounter() != null ? user.getCounter().getId() : null;
        return new AuthResponse(token, user.getRole().name(), user.getName(), user.getId(), counterId);
    }
}