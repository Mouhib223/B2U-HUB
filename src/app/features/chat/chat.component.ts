import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'b2u-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit {

  roomId!: string;
  messages: any[] = [];
  message = '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {

    this.roomId = this.route.snapshot.paramMap.get('roomId')!;

    console.log("Room ID =", this.roomId);

    this.chatService.connect(this.roomId, (msg) => {
      this.messages.push(msg);
    });
  }

  sendMessage() {

  if (!this.message.trim()) return;

  const msg = {
    sender: 'student',
    content: this.message
  };

  // ✅ 1. show instantly in UI
  this.messages.push(msg);

  // ✅ 2. send to backend
  this.chatService.sendMessage(this.roomId, msg);

  this.message = '';
}
}