package com.reitera_api.service;

import com.reitera_api.dto.AuthResponseDTO;
import com.reitera_api.dto.ChangePasswordDTO;
import com.reitera_api.dto.LoginRequestDTO;
import com.reitera_api.dto.RegisterRequestDTO;
import com.reitera_api.entity.User;
import com.reitera_api.exception.EmailAlreadyExistsException;
import com.reitera_api.repository.UserRepository;
import com.reitera_api.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDTO register(RegisterRequestDTO dto) {

        if(userRepository.findUserByEmail(dto.getEmail()).isEmpty()) {
            User user = User.create(dto.getName(), dto.getEmail(), passwordEncoder.encode(dto.getPassword()));
            userRepository.save(user);
            return new AuthResponseDTO(jwtUtil.generateToken(user.getId()), "Bearer", jwtUtil.getExpiration() / 1000, user.getName(), user.getEmail());
        } else {
            throw new EmailAlreadyExistsException("Email already in use.");
        }

    }

    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findUserByEmail(dto.getEmail()).orElseThrow(() -> new BadCredentialsException("Invalid credentials."));
        if (passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            return new AuthResponseDTO(jwtUtil.generateToken(user.getId()), "Bearer", jwtUtil.getExpiration() / 1000, user.getName(), user.getEmail());
        } else {
            throw new BadCredentialsException("Invalid credentials.");
        }
    }

    public void changePassword (User user, ChangePasswordDTO dto) {
        if (passwordEncoder.matches(dto.getOldPassword(), user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        } else {
            throw new BadCredentialsException("Password doesn't match.");
        }

        userRepository.save(user);
    }

    public void delete(User user) {
        userRepository.delete(user);
    }

}
