import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private stompClient!: Client;
  private isConnected = false;

  connect(roomId: string, callback: (msg: any) => void) {

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/chat'),

      reconnectDelay: 5000,

      onConnect: () => {
        this.isConnected = true;
        console.log("✅ CONNECTED");

        this.stompClient.subscribe(
          `/topic/messages/${roomId}`,
          (message) => {
            callback(JSON.parse(message.body));
          }
        );
      },

      onStompError: (frame) => {
        console.error("STOMP ERROR", frame);
      }
    });

    this.stompClient.activate();
  }

  sendMessage(roomId: string, message: any) {

    if (!this.isConnected) {
      console.warn("STOMP not connected yet ⏳");
      return;
    }

    this.stompClient.publish({
      destination: `/app/sendMessage/${roomId}`,
      body: JSON.stringify(message)
    });
  }
}