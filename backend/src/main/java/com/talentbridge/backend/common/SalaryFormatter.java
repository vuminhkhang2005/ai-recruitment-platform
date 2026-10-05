package com.talentbridge.backend.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class SalaryFormatter {

    private SalaryFormatter() {
    }

    public static String format(BigDecimal min, BigDecimal max, String currency, Boolean isNegotiable) {
        if (Boolean.TRUE.equals(isNegotiable) || (min == null && max == null)) {
            return "Thỏa thuận";
        }
        boolean usd = "USD".equalsIgnoreCase(currency);
        if (usd) {
            if (min != null && max != null) return "$" + min.toBigInteger() + " - $" + max.toBigInteger();
            if (min != null) return "Từ $" + min.toBigInteger();
            return "Lên đến $" + max.toBigInteger();
        }
        if (min != null && max != null) {
            return millions(min) + " - " + millions(max) + " triệu";
        }
        if (min != null) {
            return "Từ " + millions(min) + " triệu";
        }
        return "Lên đến " + millions(max) + " triệu";
    }

    private static BigDecimal millions(BigDecimal v) {
        return v.divide(new BigDecimal("1000000"), 0, RoundingMode.HALF_UP);
    }
}
