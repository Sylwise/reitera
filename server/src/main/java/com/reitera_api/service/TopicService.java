package com.reitera_api.service;

import com.reitera_api.dto.TopicRequestDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.entity.Topic;
import com.reitera_api.exception.ResourceNotFoundException;
import com.reitera_api.exception.LimitReachedException;
import com.reitera_api.repository.SubjectRepository;
import com.reitera_api.repository.TopicRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;

    public TopicService(TopicRepository topicRepository, SubjectRepository subjectRepository) {
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
    }

    public Topic addTopic(Long subjectId, TopicRequestDTO topic, Long userId) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
        Long topicNumber = topicRepository.countTopicsBySubjectId(subjectId);
        if(topicNumber >= subject.getTotalTopics()) {
            throw new LimitReachedException("Topic limit already reached.");
        }
        return topicRepository.save(Topic.create(topic, subject));
    }

    public List<Topic> getTopicsBySubject(Long subjectId, Long userId) {
        return topicRepository.findBySubjectIdAndSubjectUserId(subjectId, userId);
    }

    public List<Topic> getAllTopics(Long userId) {
        return topicRepository.findBySubjectUserId(userId);
    }

    public Topic getById(Long id, Long userId) {
        return topicRepository.findByIdAndSubjectUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
    }

    public Topic updateTopic(Long id, TopicRequestDTO dto, Long userId) {
        Topic existing = topicRepository.findByIdAndSubjectUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
        existing.setName(dto.getName());
        return topicRepository.save(existing);
    }

    public Topic resetTopic(Long id, Long userId) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
        topic.setReviewCount(0);
        topic.setNextReviewDate(LocalDate.now());
        topic.setCurrentIntervalDays(0);
        topic.setDisplayedProgressDays(0);
        return topicRepository.save(topic);
    }

    public void deleteTopic(Long id, Long userId) {
        Topic existing = topicRepository.findByIdAndSubjectUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
        topicRepository.delete(existing);
    }

}
