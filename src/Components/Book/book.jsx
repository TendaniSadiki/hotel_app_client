import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import './book.css';
import Footer from '../Footer/footer';
export default function Book() {
  const [payments, setPayments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [updatedEmail, setUpdatedEmail] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (auth.currentUser) {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
            setUpdatedEmail(userDocSnap.data().email);
          }
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsCollection = collection(db, 'payments');
        const paymentsQuery = query(paymentsCollection, where('email', '==', updatedEmail));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentData = paymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPayments(paymentData);
      } catch (error) {
        console.log('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, [updatedEmail]);

  return (
    <div className="book-container">
      <h1>Book</h1>
      {payments.length === 0 ? (
        <p>You haven't booked yet.</p>
      ) : (
        payments.map((payment) => (
          <div className="payment-card" key={payment.id}>
            {payment.room.images.length > 0 && (
              <img className="room-image" src={payment.room.images[0]} alt='room' />
            )}

            <p>Email: {payment.email}</p>
            <p>Room: {payment.room.name}</p>
            <p>Check-in Date: {payment.checkInDate}</p>
            <p>Check-out Date: {payment.checkOutDate}</p>
            <p>Total Price: R{payment.totalPrice}</p>
            <p>Timestamp: {payment.timestamp}</p>
            <p className={`room-status ${payment.roomStatus === 'NotApproved' ? 'red' : 'green'}`}>
              Room Status: {payment.roomStatus}
            </p>
            <p>Adults: {payment.room.adults}</p>
            <p>Children: {payment.room.children}</p>
            <p>Room Type: {payment.room.type}</p>

            <ul>
              {/* Add any additional list items here */}
            </ul>
          </div>
        ))
      )}
      <Footer/>
    </div>
  );
}
