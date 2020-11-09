package com.eikholm.websocketprep.model;

public class WebSocketBattlefield {
    public final int prevCoordinates;
    public final int newCoordinates;
    public final String playerName;

    public WebSocketBattlefield(int prevCoordinates, int newCoordinates, String playerName) {
        this.prevCoordinates = prevCoordinates;
        this.newCoordinates = newCoordinates;
        this.playerName = playerName;
    }

    public int getPrevCoordinates() {
        return prevCoordinates;
    }

    public int getNewCoordinates() {
        return newCoordinates;
    }

    public String getPlayerName() {
        return playerName;
    }
}
