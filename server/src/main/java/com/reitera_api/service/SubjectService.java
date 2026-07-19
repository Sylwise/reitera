package com.reitera_api.service;

import com.reitera_api.dto.SubjectRequestDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.exception.LimitReachedException;
import com.reitera_api.exception.ResourceNotFoundException;
import com.reitera_api.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository repository;


    public SubjectService(SubjectRepository repository) {
        this.repository = repository;
    }

    public Subject addSubject(Subject subject) {
        Long subjectNumber = repository.countSubjectsByUserId(subject.getUser().getId());
        if(subjectNumber >= 15) {
            throw new LimitReachedException("Subject limit reached.");
        }
        return repository.save(subject);
    }

    public List<Subject> getSubjects(Long userId) {
        return repository.findByUserId(userId);
    }

    public Subject getById(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
    }

    public Subject updateSubject(Long id, SubjectRequestDTO subject, Long userId) {
        Subject existing = repository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
        existing.setName(subject.getName());
        existing.setTotalTopics(subject.getTotalTopics());
        existing.setColor(subject.getColor());
        return repository.save(existing);
    }

    public void deleteSubject(Long id, Long userId) {
        Subject existing = repository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
        repository.delete(existing);
    }

}
