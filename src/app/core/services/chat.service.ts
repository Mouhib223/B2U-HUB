import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private stompClient: Client | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // ✅ Méthode pour récupérer l'historique - CORRIGÉE
  async getHistory(roomId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/chat/history/${roomId}`));
      return response || [];
    } catch (error) {
      console.error("Erreur chargement historique:", error);
      return [];
    }
  }

  connect(roomId: string, onMessageReceived: (msg: any) => void): void {
    console.log(`🔌 Connexion à la room: ${roomId}`);
    
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ WebSocket CONNECTÉ");
        this.connectionStatus.next(true);
        
        this.stompClient!.subscribe(
          `/topic/messages/${roomId}`,
          (message: Message) => {
            const parsedMessage = JSON.parse(message.body);
            console.log(`📨 Message reçu:`, parsedMessage);
            onMessageReceived(parsedMessage);
          }
        );
        
        console.log(`✅ Abonné au topic: /topic/messages/${roomId}`);
      },

      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame);
        this.connectionStatus.next(false);
      },
      
      onWebSocketError: (error) => {
        console.error("❌ WebSocket Error:", error);
        this.connectionStatus.next(false);
      },
      
      onDisconnect: () => {
        console.log("🔌 WebSocket Déconnecté");
        this.connectionStatus.next(false);
      }
    });

    this.stompClient.activate();
  }

  sendMessage(roomId: string, message: any): void {
    if (!this.stompClient?.connected) {
      console.warn("❌ Non connecté, message non envoyé");
      return;
    }

    console.log(`📤 Envoi:`, message);
    
    this.stompClient.publish({
      destination: `/app/sendMessage/${roomId}`,
      body: JSON.stringify(message)
    });
  }
  
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connectionStatus.next(false);
    }
  }

  // ✅ Méthode publique pour obtenir le statut de connexion
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}