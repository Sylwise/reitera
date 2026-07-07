package com.reitera_api.service;

import com.reitera_api.dto.SubjectRequestDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.entity.User;
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
        return repository.save(subject);
    }

    public List<Subject> getSubjects(User user) {
        return repository.findByUser(user);
    }

    public Subject getById(Long id, User user) {
        return repository.findByIdAndUser(id, user).orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
    }

    public Subject updateSubject(Long id, SubjectRequestDTO subject, User user) {
        Subject existing = repository.findByIdAndUser(id, user).orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
        existing.setName(subject.getName());
        existing.setTotalTopics(subject.getTotalTopics());
        existing.setColor(subject.getColor());
        return repository.save(existing);
    }

    public void deleteSubject(Long id, User user) {
        Subject existing = repository.findByIdAndUser(id, user).orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
        repository.delete(existing);
    }

}
