package com.reitera_api.dto;

import com.reitera_api.entity.Exam;

import java.time.LocalDate;

public record ExamResponseDTO(Long id, String name, LocalDate examDate,Long subjectId) {
    public static ExamResponseDTO fromEntity(Exam exam) {
        return new ExamResponseDTO(
                exam.getId(),
                exam.getName(),
                exam.getExamDate(),
                exam.getSubject().getId()
        );
    }
}
