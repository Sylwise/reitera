package com.reitera_api.dto;

import jakarta.validation.constraints.*;

public class SubjectRequestDTO {

    @Size (min = 3, max = 40)
    private String name;
    @NotNull
    private String color;
    @Min(1)
    @Max(15)
    private int total_topics;

    public SubjectRequestDTO(String name, String color, int total_topics) {
        this.name = name;
        this.color = color;
        this.total_topics = total_topics;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setTotal_topics(int total_topics) {
        this.total_topics = total_topics;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public int getTotal_topics() {
        return total_topics;
    }
}
