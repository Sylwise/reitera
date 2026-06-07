package com.reitera_api.controller;

import com.reitera_api.dto.SubjectRequestDTO;
import com.reitera_api.dto.SubjectResponseDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/subjects")
public class SubjectController {

    private final SubjectService service;

    public SubjectController(SubjectService service) {
        this.service = service;
    }

    @PostMapping()
    public ResponseEntity<SubjectResponseDTO> addSubject(@Valid @RequestBody SubjectRequestDTO dto) {
        Subject saved = service.addSubject(Subject.create(dto));
        SubjectResponseDTO response = SubjectResponseDTO.fromEntity(saved);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SubjectResponseDTO>> getSubjects() {
        List<SubjectResponseDTO> listaDto = new ArrayList<>();
        List<Subject> listaSubject = service.getSubjects();
        for (Subject subject : listaSubject) {
            listaDto.add(SubjectResponseDTO.fromEntity(subject));
        }
        return ResponseEntity.ok(listaDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectResponseDTO> getById (@PathVariable Long id) {
        Subject subject = service.getById(id);
        SubjectResponseDTO response = SubjectResponseDTO.fromEntity(subject);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectResponseDTO> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectRequestDTO dto) {
        Subject updated = service.updateSubject(id, Subject.create(dto));
        SubjectResponseDTO response = SubjectResponseDTO.fromEntity(updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById (@PathVariable Long id) {
        service.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }
}
