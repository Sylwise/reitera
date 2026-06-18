package com.reitera_api.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFound(ResourceNotFoundException exception) {
        return ResponseEntity.status(404).body(exception.getMessage());
    }

    @ExceptionHandler(TopicAlreadyMasteredException.class)
    public ResponseEntity<String> handleTopicAlreadyMastered(TopicAlreadyMasteredException exception) {
        return ResponseEntity.status(409).body(exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException exception) {
        List<FieldError> errorList = exception.getBindingResult().getFieldErrors();
        Map<String, String> errorMap = new HashMap<>();

        for(FieldError error: errorList) {
            errorMap.put(error.getField(), error.getDefaultMessage());
        }

        return ResponseEntity.status(400).body(errorMap);

    }

}
