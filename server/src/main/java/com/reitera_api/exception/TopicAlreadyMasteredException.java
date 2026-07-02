package com.reitera_api.exception;

public class TopicAlreadyMasteredException extends RuntimeException{
    public TopicAlreadyMasteredException (String exception) {
        super(exception);
    }
}
