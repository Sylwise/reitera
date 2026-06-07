package com.reitera_api.dto;

import jakarta.validation.constraints.*;

public class SubjectRequestDTO {

    @NotBlank
    @Size (min = 3, max = 40)
    private String name;
    @NotBlank
    private String color;
    @NotNull
    @Min(1)
    @Max(15)
    private Integer totalTopics;
    public SubjectRequestDTO (){}

    public void setName(String name) {
        this.name = name;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setTotalTopics(int totalTopics) {
        this.totalTopics = totalTopics;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public int getTotalTopics() {
        return totalTopics;
    }
}
