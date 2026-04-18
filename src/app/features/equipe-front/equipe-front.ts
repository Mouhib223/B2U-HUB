import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipeService } from '../../core/services/equipe.service';

@Component({
  selector: 'b2u-equipe-front',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipe-front.html',
  styleUrls: ['./equipe-front.scss'],
})
export class EquipeFront implements OnInit {

  equipes: any[] = [];
  searchQuery = '';

  constructor(private equipeService: EquipeService) {}

  ngOnInit() {
    this.loadEquipes();
  }

  loadEquipes() {
    this.equipeService.getAll().subscribe({
      next: (data: any) => {
        this.equipes = data;
      },
      error: (err) => console.error(err)
    });
  }

  get filteredEquipes() {
    return this.equipes.filter(e =>
      e.nomMembresEquipe?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // 🔥 action front office
  joinTeam(equipe: any) {
    const roomId = 'team-' + equipe.idEquipe;

    console.log('Navigate to chat:', roomId);


   
  }
}