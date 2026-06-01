package com.reitera_api.dto;

public class SubjectResponseDTO {

    private Long id;
    private String name;
    private String color;
    private int total_topics;

    public SubjectResponseDTO(Long id, String name, String color, int total_topics) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.total_topics = total_topics;
    }

    public Long getId() {
        return id;
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
