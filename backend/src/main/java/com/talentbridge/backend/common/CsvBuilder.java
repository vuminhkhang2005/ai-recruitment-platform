package com.talentbridge.backend.common;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Minimal RFC 4180 CSV builder used by the export endpoints.
 * <ul>
 *   <li>UTF-8 with BOM so Microsoft Excel renders Vietnamese characters correctly.</li>
 *   <li>CRLF line endings, fields quoted when they contain separators, quotes or line breaks.</li>
 *   <li>CSV/formula injection protection: cells starting with = + - @ (or tab/CR) are prefixed with an apostrophe.</li>
 * </ul>
 */
public final class CsvBuilder {

    private static final byte[] UTF8_BOM = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final StringBuilder sb = new StringBuilder();

    public CsvBuilder row(Object... cells) {
        List<String> out = new ArrayList<>(cells.length);
        for (Object cell : cells) {
            out.add(escape(format(cell)));
        }
        sb.append(String.join(",", out)).append("\r\n");
        return this;
    }

    /** Empty separator line, useful between sections of a multi-part report. */
    public CsvBuilder blank() {
        sb.append("\r\n");
        return this;
    }

    public String asString() {
        return sb.toString();
    }

    public byte[] toBytes() {
        byte[] body = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] out = new byte[UTF8_BOM.length + body.length];
        System.arraycopy(UTF8_BOM, 0, out, 0, UTF8_BOM.length);
        System.arraycopy(body, 0, out, UTF8_BOM.length, body.length);
        return out;
    }

    static String format(Object value) {
        if (value == null) return "";
        if (value instanceof LocalDateTime dt) return dt.format(DATE_TIME);
        if (value instanceof Collection<?> c) {
            List<String> parts = new ArrayList<>();
            for (Object o : c) parts.add(format(o));
            return String.join("; ", parts);
        }
        if (value instanceof Double d) {
            return (d == Math.rint(d)) ? String.valueOf(d.longValue()) : String.format(java.util.Locale.ROOT, "%.2f", d);
        }
        return String.valueOf(value);
    }

    static String escape(String value) {
        if (value == null || value.isEmpty()) return "";
        String v = value;
        char first = v.charAt(0);
        if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
            // Neutralise spreadsheet formulas (CSV injection) unless it is a plain negative number
            if (!v.matches("-\\d+(\\.\\d+)?")) {
                v = "'" + v;
            }
        }
        boolean needsQuotes = v.contains(",") || v.contains("\"") || v.contains("\n") || v.contains("\r") || v.contains(";");
        if (v.contains("\"")) {
            v = v.replace("\"", "\"\"");
        }
        return needsQuotes ? "\"" + v + "\"" : v;
    }
}
