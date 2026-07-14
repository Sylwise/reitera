package com.reitera_api.dto;

import com.reitera_api.entity.Difficulty;

public record DifficultyCountDTO(Difficulty difficulty, Long count) {}