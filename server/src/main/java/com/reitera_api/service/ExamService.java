package com.reitera_api.service;

import com.reitera_api.dto.ExamRequestDTO;
import com.reitera_api.entity.Exam;
import com.reitera_api.entity.Subject;
import com.reitera_api.entity.User;
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

    public Exam addExam(Long subjectId, ExamRequestDTO dto, User user) {
        Subject subject = subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("No subject found."));
        return examRepository.save(Exam.create(dto, subject));
    }

    public List<Exam> getExams(Long subjectId, User user) {
        return examRepository.findBySubjectIdAndSubjectUserId(subjectId, user.getId());
    }

    public List<Exam> getAllExams(User user) {
        return examRepository.findBySubjectUserId(user.getId());
    }

    public Exam getById(Long id, User user) {
        return examRepository.findByIdAndSubjectUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No exam found."));
    }

    public Exam updateById(Long id, ExamRequestDTO dto, User user) {
        Exam found = examRepository.findByIdAndSubjectUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No exam found."));
        found.setName(dto.getName());
        found.setExamDate(dto.getExamDate());
        return examRepository.save(found);
    }

    public void deleteExam(Long id, User user) {
        Exam existing = examRepository.findByIdAndSubjectUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No exam found."));
        examRepository.delete(existing);
    }

}
