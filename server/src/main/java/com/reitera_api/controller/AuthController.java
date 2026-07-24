package com.reitera_api.controller;

import com.reitera_api.dto.AuthResponseDTO;
import com.reitera_api.dto.ChangePasswordDTO;
import com.reitera_api.dto.LoginRequestDTO;
import com.reitera_api.dto.RegisterRequestDTO;
import com.reitera_api.entity.User;
import com.reitera_api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody @Valid RegisterRequestDTO dto) {
        return ResponseEntity.status(201).body(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user) {
        authService.delete(user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me")
    public ResponseEntity<Void> updatePassword(@AuthenticationPrincipal User user, @RequestBody @Valid ChangePasswordDTO dto){
        authService.changePassword(user, dto);
        return ResponseEntity.noContent().build();
    }

}
