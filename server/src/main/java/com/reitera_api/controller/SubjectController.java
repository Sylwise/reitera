package com.reitera_api.controller;

import com.reitera_api.dto.SubjectRequestDTO;
import com.reitera_api.dto.SubjectResponseDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subjects")
public class SubjectController {

    private final SubjectService service;

    public SubjectController(SubjectService service) {
        this.service = service;
    }

    @PostMapping()
    public ResponseEntity<SubjectResponseDTO> addSubject(@Valid @RequestBody SubjectRequestDTO dto) {
        Subject subject = new Subject(null, dto.getName(), dto.getColor(), dto.getTotalTopics());
        Subject saved = service.addSubject(subject);
        SubjectResponseDTO response = SubjectResponseDTO.fromEntity(saved);
        return ResponseEntity.status(201).body(response);
     }
}
