import { Component, OnInit } from '@angular/core';
import { TraveldataService } from '../services/traveldata.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
interface Traveler {
  name: string;
  age: number;
  mobileNumber: string;
  gender: string;
}

@Component({
  selector: 'app-travelers-info',
  templateUrl: './travelers-info.component.html',
  styleUrl: './travelers-info.component.css'
})

export class TravelersInfoComponent implements OnInit{
  travelerForm: FormGroup;
  travelers: Traveler[] = [];
  editIndex: number = -1;

  constructor(
    private formBuilder: FormBuilder,
    private traveldataService: TraveldataService
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadTravelers();
  }

  initForm() {
    this.travelerForm = this.formBuilder.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: ['', Validators.required]
    });
  }

  loadTravelers() {
    const savedTravelers = localStorage.getItem('travelers');
    if (savedTravelers) {
      this.travelers = JSON.parse(savedTravelers);
    }
  }

  saveTraveler() {
    if (this.travelerForm.valid) {
      const formValues = this.travelerForm.value;
      if (this.editIndex === -1) {
        this.travelers.push(formValues);
      } else {
        this.travelers[this.editIndex] = formValues;
        this.editIndex = -1;
      }
      localStorage.setItem('travelers', JSON.stringify(this.travelers));
      this.travelerForm.reset();
    }
  }

  editTraveler(index: number) {
    this.editIndex = index;
    const traveler = this.travelers[index];
    this.travelerForm.patchValue(traveler);
  }

  deleteTraveler(index: number) {
    this.travelers.splice(index, 1);
    localStorage.setItem('travelers', JSON.stringify(this.travelers));
  }

  gettravelerCount() {
    return this.traveldataService.selectedTravelers;

  }
}

