package com.reitera_api.dto;

import com.reitera_api.entity.Difficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReviewSessionRequestDTO {

    @NotNull
    private Difficulty difficulty;
    @NotNull
    @Min(1)
    @Max(10)
    private Integer score;

    public ReviewSessionRequestDTO() {
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}
