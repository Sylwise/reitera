package com.reitera_api.dto;

import jakarta.validation.constraints.*;

public class TopicRequestDTO {

    @NotBlank
    @Size (min = 3, max = 100)
    private String name;
    @NotNull
    private Long subjectId;

    public TopicRequestDTO() {
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getName() {
        return name;
    }

    public Long getSubjectId() {
        return subjectId;
    }
}
