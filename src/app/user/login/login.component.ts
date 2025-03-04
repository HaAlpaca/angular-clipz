import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  showAlert = false;
  alertMsg = 'Please wait! We are logging you in.';
  alertColor = 'blue';
  inSubmission = false;
  credentials = {
    email: '',
    password: '',
  };
  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}
  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! We are logging you in.';
    this.alertColor = 'blue';
    this.inSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (error) {
      this.inSubmission = false;
      this.alertMsg = 'An unexpected error has occurred. Please try again.';
      this.alertColor = 'red';
      console.log(error)
      return
    }
    this.alertMsg = 'You have been logged in successfully!';
    this.alertColor = 'green';
  }
}
