package com.talentbridge.backend.realtime;

import java.security.Principal;
import java.util.Set;

/**
 * Principal attached to a STOMP session. {@link #getName()} is the user id so the server can
 * address a user with {@code convertAndSendToUser(String.valueOf(userId), ...)}.
 */
public record StompPrincipal(Long userId, String email, Set<String> roles) implements Principal {

    @Override
    public String getName() {
        return String.valueOf(userId);
    }

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
}
