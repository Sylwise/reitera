package com.reitera_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
public class AppClock {

    private static ZoneId zone = ZoneId.of("Europe/Madrid");

    public AppClock(@Value("${app.timezone:Europe/Madrid}") String timezone) {
        zone = ZoneId.of(timezone);
    }

    public static LocalDate today() {
        return LocalDate.now(zone);
    }

}
