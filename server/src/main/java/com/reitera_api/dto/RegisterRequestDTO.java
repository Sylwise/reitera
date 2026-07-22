package com.reitera_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequestDTO {

    @NotBlank
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres.")
    private String name;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres.")
    private String password;

    public RegisterRequestDTO() {
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }
}
