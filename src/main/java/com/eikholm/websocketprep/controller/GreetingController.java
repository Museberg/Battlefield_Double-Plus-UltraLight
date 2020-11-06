package com.eikholm.websocketprep.controller;

import com.eikholm.websocketprep.model.Greeting;
import com.eikholm.websocketprep.model.WebSocketMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashSet;
import java.util.Set;

@Controller
public class GreetingController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final Set<String> connectedUsers = new HashSet<>();

    public GreetingController( SimpMessagingTemplate s) {
        simpMessagingTemplate = s;
    }
    
    @MessageMapping("/register")
    public void registerUser(String userName){
        System.out.println("register called with "+ userName);
        if(!connectedUsers.contains(userName)){ // only allow unique usernames
            connectedUsers.add(userName);
        }
    }

    @MessageMapping("/hello")
    public void processMessageFromClient(WebSocketMessage message){
        System.out.println("controller kaldt til: " + message.toWhom + " fra: " + message.fromWho + " message: " + message.message );
        Greeting greeting = new Greeting(message.fromWho + ": " + message.message);
        connectedUsers.forEach(user -> {
            simpMessagingTemplate.convertAndSendToUser(user, "/msg", greeting); // genial metode !
        });
    }
}