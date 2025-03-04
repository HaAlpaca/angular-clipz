import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  inSubmission = false;
  showAlert = false;
  alertMsg = 'Please wait! Your account is being created.';
  alertColor = 'blue';
  name = new FormControl<string | null>('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl<string | null>('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/),
  ]);
  confirm_password = new FormControl<string | null>('', [Validators.required]);
  phoneNumber = new FormControl<string | null>('', [
    Validators.required,
    Validators.minLength(13),
    Validators.minLength(13),
  ]);

  registerForm = new FormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      phoneNumber: this.phoneNumber,
      confirm_password: this.confirm_password,
    },
    [RegisterValidators.match('password', 'confirm_password')]
  );
  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

  ngOnInit(): void {}
  async register() {
    console.log('registed');
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    this.inSubmission = true;
    try {
      this.auth.createUser(this.registerForm.value as IUser);
    } catch (error) {
      console.log(error);
      this.alertMsg = 'An unexpected error has occurred. Please try again.';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMsg = 'Your account has been created successfully.';
    this.alertColor = 'green';
  }
}
