package com.eikholm.websocketprep.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/user"); // server will listen for this topic
        // /topic : send to all subscribers to /topic
        // /user  : send to one specific user, using SimpMessagingTemplate.convertAndSendToUser(...)
        // /queue : send only to the sender of current request
        registry.setApplicationDestinationPrefixes("/app"); // set global prefix for all topics
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/my-endpoint")
//                .setHandshakeHandler(new CustomHandshakeHandler()) // kan tilføjes for at intercepte, og give et ID
                .withSockJS();

    }
}
