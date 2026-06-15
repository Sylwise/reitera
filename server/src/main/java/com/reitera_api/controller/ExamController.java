package com.reitera_api.controller;

import com.reitera_api.dto.ExamRequestDTO;
import com.reitera_api.dto.ExamResponseDTO;
import com.reitera_api.entity.Exam;
import com.reitera_api.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService service;

    public ExamController (ExamService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExamResponseDTO> addExam (@Valid @RequestBody ExamRequestDTO dto) {
        return ResponseEntity.status(201).body(ExamResponseDTO.fromEntity(service.addExam(dto.getSubjectId(), dto)));
    }

    @GetMapping
    public ResponseEntity<List<ExamResponseDTO>> findExamsBySubjectId(@RequestParam Long subjectId) {
        List<Exam> existing = service.getExams(subjectId);
        List<ExamResponseDTO> responseDTOList = new ArrayList<>();

        for (Exam exam : existing) {
            responseDTOList.add(ExamResponseDTO.fromEntity(exam));
        }

        return ResponseEntity.ok(responseDTOList);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<ExamResponseDTO> findExamById (@PathVariable Long id) {
        return ResponseEntity.ok(ExamResponseDTO.fromEntity(service.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamResponseDTO> updateExamById (@PathVariable Long id, @Valid @RequestBody ExamRequestDTO dto) {
        return ResponseEntity.ok(ExamResponseDTO.fromEntity(service.updateById(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExamById(@PathVariable Long id) {
        service.deleteExam(id);
        return ResponseEntity.noContent().build();
    }
}
