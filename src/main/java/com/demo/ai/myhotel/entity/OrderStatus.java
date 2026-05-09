package com.demo.ai.myhotel.entity;

public enum OrderStatus {
    BOOKED("booked"),
    CHECKED_IN("checked_in"),
    CHECKED_OUT("checked_out"),
    CANCELLED("cancelled");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }
}
