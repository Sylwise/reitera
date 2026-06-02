package com.reitera_api.service;

import com.reitera_api.entity.Subject;
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
      return  repository.save(subject);
    }

    public List<Subject> getSubjects () {
        return repository.findAll();
    }

    public Subject updateSubject(Long id, Subject subject) {
        Subject existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Subject not found"));
        existing.setName(subject.getName());
        existing.setTotalTopics(subject.getTotalTopics());
        existing.setColor(subject.getColor());
        return repository.save(existing);
    }

    public void deleteSubject(Long id) {
        repository.deleteById(id);
    }

}
