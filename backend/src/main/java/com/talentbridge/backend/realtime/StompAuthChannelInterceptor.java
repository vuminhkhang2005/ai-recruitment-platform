package com.talentbridge.backend.realtime;

import com.talentbridge.backend.security.JwtTokenProvider;
import com.talentbridge.backend.security.UserDetailsServiceImpl;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Authenticates STOMP CONNECT frames with the JWT access token and authorises SUBSCRIBE frames.
 * SEND frames are rejected: every write goes through the validated REST API.
 */
@Slf4j
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final Pattern THREAD_TOPIC = Pattern.compile("^/topic/applications/(\\d+)$");

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
    private final MessageService messageService;

    public StompAuthChannelInterceptor(JwtTokenProvider tokenProvider,
                                       UserDetailsServiceImpl userDetailsService,
                                       @Lazy MessageService messageService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
        this.messageService = messageService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (StompCommand.CONNECT.equals(command)) {
            accessor.setUser(authenticate(accessor));
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            authorizeSubscription(accessor);
        } else if (StompCommand.SEND.equals(command)) {
            throw new AccessDeniedException("Gửi dữ liệu qua REST API, kênh WebSocket chỉ dùng để nhận.");
        }
        return message;
    }

    private StompPrincipal authenticate(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        String token = header != null && header.startsWith("Bearer ") ? header.substring(7) : header;
        if (!StringUtils.hasText(token) || !tokenProvider.validateToken(token)) {
            throw new AccessDeniedException("WebSocket: thiếu hoặc sai access token");
        }
        UserPrincipal user = (UserPrincipal) userDetailsService.loadUserByUsername(tokenProvider.getEmailFromToken(token));
        return new StompPrincipal(user.getId(), user.getEmail(),
                user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet()));
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        if (!(accessor.getUser() instanceof StompPrincipal principal)) {
            throw new AccessDeniedException("WebSocket: chưa xác thực");
        }
        String destination = accessor.getDestination();
        if (destination == null) {
            throw new AccessDeniedException("WebSocket: thiếu destination");
        }
        if (destination.startsWith("/user/queue/")) {
            return; // personal queue, resolved per session principal
        }
        Matcher m = THREAD_TOPIC.matcher(destination);
        if (m.matches() && messageService.canAccessThread(principal.userId(), Long.valueOf(m.group(1)))) {
            return;
        }
        log.warn("Rejected STOMP subscription of user {} to {}", principal.userId(), destination);
        throw new AccessDeniedException("WebSocket: không có quyền theo dõi kênh này");
    }
}
