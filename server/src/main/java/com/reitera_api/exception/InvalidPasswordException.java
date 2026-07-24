package com.reitera_api.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException(String exception) {
        super(exception);
    }
}
