package com.reitera_api.dto;

import jakarta.validation.constraints.*;

public class SubjectRequestDTO {

    @Size (min = 3, max = 40)
    private String name;
    @NotNull
    private String color;
    @Min(1)
    @Max(15)
    private int totalTopics;
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
