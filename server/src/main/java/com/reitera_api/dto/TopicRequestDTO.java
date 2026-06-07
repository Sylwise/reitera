package com.reitera_api.dto;

import jakarta.validation.constraints.*;

public class TopicRequestDTO {

    @NotBlank
    @Size (min = 3, max = 100)
    private String name;
    @NotNull
    @Min(2)
    @Max(6)
    private Integer reviewsNeeded;
    @NotNull
    private Long subjectId;

    public TopicRequestDTO() {
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setReviewsNeeded(int reviewsNeeded) {
        this.reviewsNeeded = reviewsNeeded;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getName() {
        return name;
    }

    public int getReviewsNeeded() {
        return reviewsNeeded;
    }

    public Long getSubjectId() {
        return subjectId;
    }
}
