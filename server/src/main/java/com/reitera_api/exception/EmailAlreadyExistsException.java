package com.reitera_api.exception;

public class EmailAlreadyExistsException extends RuntimeException{
    public EmailAlreadyExistsException (String exception) {
        super(exception);
    }
}
