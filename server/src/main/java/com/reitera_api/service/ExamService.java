package com.reitera_api.service;

import com.reitera_api.dto.ExamRequestDTO;
import com.reitera_api.entity.Exam;
import com.reitera_api.entity.Subject;
import com.reitera_api.repository.ExamRepository;
import com.reitera_api.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;

    public ExamService(ExamRepository examRepository, SubjectRepository subjectRepository) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
    }

    public Exam addExam(Long subjectId, ExamRequestDTO dto) {
        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new RuntimeException("No subject found."));
        return examRepository.save(Exam.create(dto, subject));
    }

    public List<Exam> getExams (Long id) {
        return examRepository.findBySubjectId(id);
    }

    public Exam getById (Long id) {
        return examRepository.findById(id).orElseThrow(() -> new RuntimeException("No exam found."));
    }

    public Exam updateById (Long id, ExamRequestDTO dto) {
        Exam found = examRepository.findById(id).orElseThrow(() -> new RuntimeException("No exam found."));
        found.setName(dto.getName());
        found.setExamDate(dto.getExamDate());
        return examRepository.save(found);
    }

    public void deleteExam (Long id) {
        examRepository.deleteById(id);
    }

}
