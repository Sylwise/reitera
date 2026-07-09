package com.reitera_api.dto;

public record AuthResponseDTO(String token, String tokenType, Long expiresIn, String name, String email) {}
