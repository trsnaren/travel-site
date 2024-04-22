import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-mybookings',
  templateUrl: './mybookings.component.html',
  styleUrls: ['./mybookings.component.css']
})
export class MybookingsComponent implements OnInit {
 
  bookings$: Observable<any[]>;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private authService : AuthService
  ) {
    this.authService = authService;
    this.bookings$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          const userBookingsRef = this.afs.collection(`bookings/${user.uid}/userBookings`).snapshotChanges();
          return userBookingsRef.pipe(
            // Map snapshotChanges to get the document data along with the document ID
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, data };
              });
            })
          );
        } else {
          return of([]);
        }
      })
    );
  }

  ngOnInit(): void {}

   getCurrentDate(): Date {
    return new Date();
  }
 
  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  
  cancelBooking(bookingId: string) {
    this.afAuth.currentUser.then((user) => {
      if (user) {
        console.log('Deleting booking with ID:', bookingId);
        const userBookingRef = this.afs.collection(`bookings/${user.uid}/userBookings`).doc(bookingId);
        userBookingRef.delete()
          .then(() => {
            console.log('Booking canceled successfully!');
          })
          .catch((error) => {
            console.error('Error canceling booking:', error);
          });
      }
    }).catch((error) => {
      console.error('Error getting current user:', error);
    });
  }
  
 
  
}