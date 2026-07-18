package com.reitera_api.exception;

public class LimitReachedException extends RuntimeException{
    public LimitReachedException(String exception) {
        super(exception);
    }
}
