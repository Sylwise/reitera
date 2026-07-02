package com.reitera_api.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException (String exception) {
        super(exception);
    }
}
