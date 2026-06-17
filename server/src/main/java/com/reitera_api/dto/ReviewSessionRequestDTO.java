package com.reitera_api.dto;

import com.reitera_api.entity.Difficulty;
import jakarta.validation.constraints.NotNull;

public class ReviewSessionRequestDTO {

    @NotNull
    private Difficulty difficulty;
    private String score;

    public ReviewSessionRequestDTO() {
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }
}
