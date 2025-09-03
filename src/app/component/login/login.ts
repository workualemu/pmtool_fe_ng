import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  title = 'Login Component';
  courses = [
    {title: "Angular", price: 40, description: "Angular course for begginers", date: "2023-08-01", soldout: false, onsale: true},
    {title: "React", price: 40, description: "React course for begginers", date: "2025-09-15", soldout: true, onsale: true},
    {title: "Vue", price: 40, description: "Vue course for begginers", date: "2023-10-21", soldout: false, onsale: true},
  ]
}
