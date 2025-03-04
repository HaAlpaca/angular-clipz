import { Component, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  constructor(
    public modal: ModalService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}
  openModal($event: Event) {
    $event.preventDefault();
    this.modal.toggleModal('auth');
  }
}
