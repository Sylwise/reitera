package com.reitera_api.service;

import com.reitera_api.dto.ExamRequestDTO;
import com.reitera_api.entity.Exam;
import com.reitera_api.entity.Subject;
import com.reitera_api.exception.LimitReachedException;
import com.reitera_api.exception.ResourceNotFoundException;
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

    public Exam addExam(Long subjectId, ExamRequestDTO dto, Long userId) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("No subject found."));
        Long examNumber = examRepository.countExamsBySubjectId(subjectId);
        if(examNumber >= 10) {
            throw new LimitReachedException("Exam limit reached.");
        }
        return examRepository.save(Exam.create(dto, subject));
    }

    public List<Exam> getExams(Long subjectId, Long userId) {
        return examRepository.findBySubjectIdAndSubjectUserId(subjectId, userId);
    }

    public List<Exam> getAllExams(Long userId) {
        return examRepository.findBySubjectUserId(userId);
    }

    public Exam getById(Long id, Long userId) {
        return examRepository.findByIdAndSubjectUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("No exam found."));
    }

    public Exam updateById(Long id, ExamRequestDTO dto, Long userId) {
        Exam found = examRepository.findByIdAndSubjectUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("No exam found."));
        found.setName(dto.getName());
        found.setExamDate(dto.getExamDate());
        return examRepository.save(found);
    }

    public void deleteExam(Long id, Long userId) {
        Exam existing = examRepository.findByIdAndSubjectUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("No exam found."));
        examRepository.delete(existing);
    }

}
