import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TourPackagesService } from '../services/tour-packages.service';
import { TourPackage } from '../model/tour-package';
import { ConfirmBookingModalComponent } from '../confirm-booking-modal/confirm-booking-modal.component';
import { TraveldataService } from '../services/traveldata.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../shared/auth.service';




@Component({
  selector: 'app-package-detail',
  templateUrl: './package-detail.component.html',
  styleUrls: ['./package-detail.component.css']
})
export class PackageDetailComponent implements OnInit {
  selectedTravelers: number;
  selectedDate: string;
  package: TourPackage | undefined;
  totalCost: number = 0;
  costPerPerson: number;
  buttonClicked = false;

  @ViewChild(ConfirmBookingModalComponent) confirmModal: ConfirmBookingModalComponent;

  constructor(
    private route: ActivatedRoute,
    private tourPackagesService: TourPackagesService,
    private traveldataService: TraveldataService,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private authService : AuthService
  ) {
    this.authService = authService;
  }

  ngOnInit() {
    const packageId = this.route.snapshot.paramMap.get('id');
    if (packageId) {
      const regions = ['1', '2', '3', '4'];
      for (const region of regions) {
        const tourPackage = this.tourPackagesService.getTourPackages(region).find(p => p.packageId === packageId);
        if (tourPackage) {
          this.package = tourPackage;
          this.costPerPerson = tourPackage.costPerPerson;

          this.traveldataService.getSelectedSearchDetails().subscribe((details) => {
            this.selectedTravelers = details.travelers;
            this.selectedDate = details.date;
            this.calculateTotal();
          });
          break;
        }
      }
    }
  }

  calculateTotal() {
    if (this.package && this.selectedTravelers) {
      this.totalCost = this.costPerPerson * this.selectedTravelers;
    }
  }
 
  onClick() {
    this.buttonClicked = true;
  }
  openConfirmBookingModal() {
    const bookingData = {
      packageName: this.package?.packageName,
      description: this.package?.description,
      countryName: this.package?.countryName,
      selectedTravelers: this.selectedTravelers,
      selectedDate: this.selectedDate,
      totalCost: this.totalCost,
      dateBooked: new Date(),
    };
  
    console.log("pkg", bookingData);
  
    this.afAuth.currentUser.then((user) => {
      if (user) {
        console.log("adding to db");
        const userBookingsRef = this.afs.collection(`bookings/${user.uid}/userBookings`);
        userBookingsRef.add(bookingData);
      }
    });
  
    if (this.confirmModal) {
      this.confirmModal.openModal();
    }
  }

  handleConfirmation({ email, phone }: { email: string; phone: string }) {
    console.log('Booking confirmed for:', email, phone);
  }
  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}