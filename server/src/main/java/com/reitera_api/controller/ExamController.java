package com.reitera_api.controller;

import com.reitera_api.dto.ExamRequestDTO;
import com.reitera_api.dto.ExamResponseDTO;
import com.reitera_api.entity.Exam;
import com.reitera_api.entity.User;
import com.reitera_api.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService service;

    public ExamController(ExamService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExamResponseDTO> addExam(@Valid @RequestBody ExamRequestDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201)
                .body(ExamResponseDTO.fromEntity(service.addExam(dto.getSubjectId(), dto, user.getId())));
    }

    @GetMapping
    public ResponseEntity<List<ExamResponseDTO>> findExams(@RequestParam(required = false) Long subjectId,
            @AuthenticationPrincipal User user) {
        List<Exam> existing = subjectId != null ? service.getExams(subjectId, user.getId()) : service.getAllExams(user.getId());
        List<ExamResponseDTO> responseDTOList = new ArrayList<>();

        for (Exam exam : existing) {
            responseDTOList.add(ExamResponseDTO.fromEntity(exam));
        }

        return ResponseEntity.ok(responseDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponseDTO> findExamById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ExamResponseDTO.fromEntity(service.getById(id, user.getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamResponseDTO> updateExamById(@PathVariable Long id,
            @Valid @RequestBody ExamRequestDTO dto, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ExamResponseDTO.fromEntity(service.updateById(id, dto, user.getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExamById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        service.deleteExam(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
