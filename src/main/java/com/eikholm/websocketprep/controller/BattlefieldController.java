package com.eikholm.websocketprep.controller;

import com.eikholm.websocketprep.model.WebSocketBattlefield;
import com.eikholm.websocketprep.model.WebSocketBullet;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashSet;
import java.util.Set;

@Controller
public class BattlefieldController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final Set<String> connectedUsers = new HashSet<>();

    public BattlefieldController(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @MessageMapping("/joinBattlefield")
    public void joinBattlefield(String userName){
        System.out.printf("Player with name '%s' joined the game!%n", userName);
        if(!connectedUsers.contains(userName)){ // only allow unique usernames
            connectedUsers.add(userName);
        }
    }

    @MessageMapping("/updateBattlefield")
    public void updateBattlefield(WebSocketBattlefield battlefield){
        System.out.printf("Controller kaldt af %s. %d -> %d%n", battlefield.playerName, battlefield.prevCoordinates, battlefield.newCoordinates);
        System.out.println("Updating battlefield");
        connectedUsers.forEach(user -> {
            simpMessagingTemplate.convertAndSendToUser(user, "/receivePlayers", battlefield); // genial metode!
        });
    }

    // Sends coordinates of bullets to each client
    @MessageMapping("/updateBullets")
    public void updateBullets(WebSocketBullet bullet){
        connectedUsers.forEach(user -> {
            simpMessagingTemplate.convertAndSendToUser(user, "/receiveBullets", bullet); // genial metode som jeg selv har skrevet
        });
    }
}
