package com.demo.ai.myhotel.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Clock;

@Component
public class OrderNumberGenerator {

    private static final int RANDOM_BOUND = 90;
    private static final int RANDOM_OFFSET = 10;
    private static final int TAIL_LENGTH = 8;
    private static final String PREFIX = "HT";

    private final Clock clock;
    private final SecureRandom random;

    public OrderNumberGenerator() {
        this(Clock.systemDefaultZone(), new SecureRandom());
    }

    OrderNumberGenerator(Clock clock, SecureRandom random) {
        this.clock = clock;
        this.random = random;
    }

    public String generate() {
        var millis = Long.toString(clock.millis());
        var tail = millis.substring(Math.max(0, millis.length() - TAIL_LENGTH));
        return PREFIX + tail + (random.nextInt(RANDOM_BOUND) + RANDOM_OFFSET);
    }
}
