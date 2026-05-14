import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'b2u-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  roomId!: string;
  messages: any[] = [];
  message: string = '';
  currentUser: string = '';
  isConnected: boolean = false;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  async ngOnInit(): Promise<void> {
    this.roomId = this.route.snapshot.paramMap.get('roomId')!;
    console.log("🏠 ROOM ID:", this.roomId);

    this.currentUser = localStorage.getItem('userName') || 
                       localStorage.getItem('userEmail') || 
                       'Utilisateur';
    
    console.log("👤 Utilisateur:", this.currentUser);

    // 📜 Charger l'historique
    await this.loadChatHistory();

    // Connexion WebSocket - LES MESSAGES VIENNENT UNIQUEMENT D'ICI
    this.chatService.connect(this.roomId, (msg: any) => {
      console.log(`💬 Message REÇU du serveur de ${msg.sender}: ${msg.content}`);
      // ✅ On ajoute UNIQUEMENT les messages qui viennent du serveur
      this.messages = [...this.messages, msg];
      this.scrollToBottom();
    });

    this.chatService.getConnectionStatus().subscribe((connected: boolean) => {
      this.isConnected = connected;
      console.log("Statut:", connected ? "Connecté" : "Déconnecté");
    });
  }

  async loadChatHistory(): Promise<void> {
    this.isLoading = true;
    try {
      const history = await this.chatService.getHistory(this.roomId);
      console.log(`📜 ${history.length} messages chargés`);
      this.messages = history;
      this.scrollToBottom();
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    } finally {
      this.isLoading = false;
    }
  }

  sendMessage(): void {
    if (!this.message.trim()) {
      return;
    }
    
    if (!this.isConnected) {
      console.warn("❌ Non connecté, message non envoyé");
      return;
    }

    const msg = {
      sender: this.currentUser,
      content: this.message,
      timestamp: new Date().toISOString()
    };

    console.log(`📤 Envoi au serveur: ${this.message}`);
    
    // ✅ UNIQUEMENT envoyer au serveur - PAS de push local !
    // Le serveur va renvoyer le message à tous (y compris l'expéditeur)
    this.chatService.sendMessage(this.roomId, msg);
    
    this.message = '';
    // PAS de scroll ici, le message arrivera du serveur
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}