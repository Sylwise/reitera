package com.reitera_api.controller;

import com.reitera_api.dto.SubjectRequestDTO;
import com.reitera_api.dto.SubjectResponseDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.entity.User;
import com.reitera_api.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService service;

    public SubjectController(SubjectService service) {
        this.service = service;
    }

    @PostMapping()
    public ResponseEntity<SubjectResponseDTO> addSubject(@Valid @RequestBody SubjectRequestDTO dto, @AuthenticationPrincipal User currentUser) {
        Subject subject = Subject.create(dto);
        subject.setUser(currentUser);
        Subject saved = service.addSubject(subject);
        SubjectResponseDTO response = SubjectResponseDTO.fromEntity(saved);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SubjectResponseDTO>> getSubjects(@AuthenticationPrincipal User currentUser) {
        List<SubjectResponseDTO> listaDto = new ArrayList<>();
        List<Subject> listaSubject = service.getSubjects(currentUser.getId());
        for (Subject subject : listaSubject) {
            listaDto.add(SubjectResponseDTO.fromEntity(subject));
        }
        return ResponseEntity.ok(listaDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectResponseDTO> getById (@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        Subject subject = service.getById(id, currentUser.getId());
        SubjectResponseDTO response = SubjectResponseDTO.fromEntity(subject);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectResponseDTO> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectRequestDTO dto, @AuthenticationPrincipal User currentUser) {
        Subject updated = service.updateSubject(id, dto, currentUser.getId());
        SubjectResponseDTO response = SubjectResponseDTO.fromEntity(updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById (@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        service.deleteSubject(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
