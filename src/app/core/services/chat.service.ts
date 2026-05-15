import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

type StompCallback = (message: Record<string, unknown>) => void;

@Injectable({ providedIn: 'root' })
export class ChatService {

  private socket: WebSocket | null = null;
  private roomId?: string;
  private onMessageReceived?: StompCallback;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private apiUrl = 'http://localhost:8080';
  private reconnectTimer?: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient) {}

  async getHistory(roomId: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/chat/history/${roomId}`));
      return response || [];
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      return [];
    }
  }

  connect(roomId: string, onMessageReceived: StompCallback): void {
    this.disconnect();

    this.roomId = roomId;
    this.onMessageReceived = onMessageReceived;
    this.socket = new WebSocket(this.buildSockJsWebSocketUrl());

    this.socket.onopen = () => {
      console.log('WebSocket ouvert');
    };

    this.socket.onmessage = event => this.handleSocketMessage(String(event.data));

    this.socket.onerror = error => {
      console.error('WebSocket Error:', error);
      this.connectionStatus.next(false);
    };

    this.socket.onclose = () => {
      this.connectionStatus.next(false);
      this.scheduleReconnect();
    };
  }

  sendMessage(roomId: string, message: unknown): void {
    if (!this.socket || !this.connectionStatus.value) {
      console.warn('Non connecte, message non envoye');
      return;
    }

    this.sendFrame(
      'SEND',
      {
        destination: `/app/sendMessage/${roomId}`,
        'content-type': 'application/json'
      },
      JSON.stringify(message)
    );
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.connectionStatus.next(false);
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  private handleSocketMessage(data: string): void {
    if (data === 'o') {
      this.sendFrame('CONNECT', {
        'accept-version': '1.2',
        'heart-beat': '10000,10000'
      });
      return;
    }

    if (data === 'h') return;

    if (data.startsWith('a')) {
      const frames = JSON.parse(data.slice(1)) as string[];
      frames.forEach(frame => this.handleFrame(frame));
      return;
    }

    if (data.startsWith('c')) {
      this.connectionStatus.next(false);
    }
  }

  private handleFrame(rawFrame: string): void {
    for (const frame of rawFrame.split('\0').filter(Boolean)) {
      const separator = frame.indexOf('\n\n');
      const headerBlock = separator >= 0 ? frame.slice(0, separator) : frame;
      const body = separator >= 0 ? frame.slice(separator + 2) : '';
      const [command] = headerBlock.split('\n');

      if (command === 'CONNECTED') {
        this.connectionStatus.next(true);
        this.subscribeToRoom();
        continue;
      }

      if (command === 'MESSAGE') {
        this.handleMessageBody(body);
        continue;
      }

      if (command === 'ERROR') {
        console.error('STOMP Error:', body || frame);
        this.connectionStatus.next(false);
      }
    }
  }

  private handleMessageBody(body: string): void {
    try {
      this.onMessageReceived?.(JSON.parse(body));
    } catch {
      this.onMessageReceived?.({ content: body });
    }
  }

  private subscribeToRoom(): void {
    if (!this.roomId) return;

    this.sendFrame('SUBSCRIBE', {
      id: `sub-${this.roomId}`,
      destination: `/topic/messages/${this.roomId}`
    });
  }

  private sendFrame(command: string, headers: Record<string, string>, body = ''): void {
    const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
    this.socket?.send(`${command}\n${headerLines.join('\n')}\n\n${body}\0`);
  }

  private buildSockJsWebSocketUrl(): string {
    const wsBaseUrl = this.apiUrl.replace(/^http/, 'ws');
    const serverId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const sessionId = Math.random().toString(36).slice(2, 10);
    return `${wsBaseUrl}/chat/${serverId}/${sessionId}/websocket`;
  }

  private scheduleReconnect(): void {
    if (!this.roomId || !this.onMessageReceived || this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      if (this.roomId && this.onMessageReceived) {
        this.connect(this.roomId, this.onMessageReceived);
      }
    }, 5000);
  }
}
