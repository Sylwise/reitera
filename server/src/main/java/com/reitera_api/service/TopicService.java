package com.reitera_api.service;

import com.reitera_api.dto.TopicRequestDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.entity.Topic;
import com.reitera_api.repository.SubjectRepository;
import com.reitera_api.repository.TopicRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;

    public TopicService (TopicRepository topicRepository, SubjectRepository subjectRepository) {
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
    }

    public Topic addTopic(Long id, TopicRequestDTO topic) {
        Subject subject = subjectRepository.findById(id).orElseThrow(() -> new RuntimeException("Subject not found"));
        return topicRepository.save(Topic.create(topic, subject));
    }

    public List<Topic> getTopics () {
        return topicRepository.findAll();
    }

    public Topic getById (Long id) {
        return topicRepository.findById(id).orElseThrow(() -> new RuntimeException("Topic not found."));
    }

    public Topic updateTopic (Long id, Topic topic) {
        Topic existing = topicRepository.findById(id).orElseThrow(() -> new RuntimeException("No topic found."));
        existing.setName(topic.getName());
        existing.setReviewsNeeded(topic.getReviewsNeeded());
        return topicRepository.save(existing);
    }

    public void deleteTopic (Long id) {
        topicRepository.deleteById(id);
    }

}
