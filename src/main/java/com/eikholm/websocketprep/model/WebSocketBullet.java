package com.eikholm.websocketprep.model;

public class WebSocketBullet {
    public final int prevCoordinates;
    public final int newCoordinates;

    public WebSocketBullet(int prevCoordinates, int newCoordinates) {
        this.prevCoordinates = prevCoordinates;
        this.newCoordinates = newCoordinates;
    }
}
