import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../config/firebase';
import { useCookies } from 'react-cookie';

import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import './home.css';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import {CgCloseO} from "react-icons/cg";
import 'swiper/swiper.min.css';
import Footer from '../Footer/footer';
import Loader from '../Loader/Loader';

SwiperCore.use([Navigation, Pagination, Autoplay]);

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomStatus] = useState('NotApproved');
  const [userProfile, setUserProfile] = useState(null);
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); // New state variable for the payment modal
  const [confirmPriceClicked, setConfirmPriceClicked] = useState(false); // Track if "Confirm price" button is clicked
  const [numOfNights, setNumOfNights] = useState(0); 
  const swiperRef = useRef(null);
  const [cookies, setCookie] = useCookies(['bookingCookie']);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);
  const [paymentFailureModalOpen, setPaymentFailureModalOpen] = useState(false);
  console.log(cookies)
  useEffect(() => {
    // Fetch rooms data
    const fetchRooms = async () => {
      try {
        const roomCollection = collection(db, 'rooms');
        const roomSnapshot = await getDocs(roomCollection);
        const roomData = roomSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomData);
        setIsLoading(false);
        // Create headerCarouselImages collection and push the first images
        const headerCarouselImagesCollection = collection(
          db,
          'headerCarouselImages'
        );
        const batch = writeBatch(db);

        roomData.forEach((room) => {
          const headerImage = room.images[0];
          const newDocRef = doc(headerCarouselImagesCollection);
          batch.set(newDocRef, { image: headerImage });
        });

        await batch.commit();
      } catch (error) {
        console.log('Error fetching rooms:', error);
        setError('Error fetching rooms');
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    // Fetch user profile data
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

  const openModal = (room) => {
    setSelectedRoom(room);
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setBookingModalOpen(false);
    setCheckInDate("");
    setCheckOutDate("");
    setTotalPrice(0);
    setConfirmPriceClicked(false); // Reset the state of the "Confirm price" button
    setError(null);
  };

  const openBookingModal = () => {
    setBookingModalOpen(true);
  };

  const handleBooking = () => {
    console.log('Room:', selectedRoom);
    console.log('Check-in Date:', checkInDate);
    console.log('Check-out Date:', checkOutDate);

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError('Please enter valid check-in and check-out dates.');
      return;
    }

    const timeDiff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) {
      setError('Check-out date should be after check-in date.');
      return;
    }

    const totalPrice = selectedRoom.price * nights;
    setTotalPrice(totalPrice);
    setNumOfNights(nights); // Update the number of nights
    setConfirmPriceClicked(true);
    setError(null);

    // Rest of the code...
  };
// Function to handle payment success modal close
const handlePaymentSuccessModalClose = () => {
  setPaymentSuccessModalOpen(false);
  setSelectedRoom(null);
  setCheckInDate('');
  setCheckOutDate('');
  setUpdatedEmail('');
  setTotalPrice(0);
  setCurrentSlide(0);
  setConfirmPriceClicked(false);
};

// Function to handle payment failure modal close
const handlePaymentFailureModalClose = () => {
  setPaymentFailureModalOpen(false);
};

  const handlePayment = async () => {
    // Handle payment process
  
    // Validate payment details
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
  
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setError('Please fill in all the payment details.');
      return;
    }
  
    // Save payment information to a new collection
    try {
      // Create a new payment document
      const paymentRef = await addDoc(collection(db, 'payments'), {
        email: userProfile.email,
        room: selectedRoom,
        checkInDate,
        checkOutDate,
        totalPrice,
        cardNumber,
        cardName,
        expiryDate,
        cvv,
        timestamp: new Date().getTime(),
        roomStatus: roomStatus,
       
      });
      setCookie('bookingCookie', paymentRef.id, { path: '/' });
      setPaymentSuccessModalOpen(true);
      // Display success message or perform any further actions
      console.log('Payment successful. Payment ID:', paymentRef.id);
    } catch (error) {
      console.log('Error saving payment:', error);
      setError('Error saving payment');setPaymentFailureModalOpen(true);
    }
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? selectedRoom.images.length - 1 : prevSlide - 1
    );
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === selectedRoom.images.length - 1 ? 0 : prevSlide + 1
    );
  };

  const goToPrevious = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? roomHeaderImages.length - 1 : prevSlide - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === roomHeaderImages.length - 1 ? 0 : prevSlide + 1
    );
  };

  const roomHeaderImages = rooms.map((room) => room.images[0]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideNext();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [currentSlide]);

  return (
    <div className="home-container">
    <h1>Welcome</h1>

    <div className="container">
      <div className="mainCarousel">
        <Swiper
          ref={swiperRef}
          slidesPerView={1}
          navigation
          pagination
          autoplay={{ delay: 5000 }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        >
          {roomHeaderImages.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                className={`carousel-image ${
                  index === currentSlide ? 'active' : ''
                }`}
                src={image}
                alt={`Room ${rooms[index].name}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <IoIosArrowBack className="arrow left" onClick={goToPrevious} />
        <IoIosArrowForward className="arrow right" onClick={goToNext} />
      </div>

      <h2>Rooms</h2>

      <div className="room-container">
      {isLoading ? (
        <Loader />
      ) : (
        rooms.map((room, index) => (
          <div
            className="room-card"
            key={room.id}
            onClick={() => openModal(room)}
          >
            <img
              className="room-image"
              src={roomHeaderImages[index]}
              alt={`Room ${room.name}`}
            />
            <div className="room-details">
              <h3 className="room-name">{room.name}</h3>
              <p className="room-type">{room.type}</p>
            </div>
          </div>
          )
        ))}
      </div>

      {selectedRoom && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              <CgCloseO/>
            </span>
            <div className="carousel">
              <IoIosArrowBack
                className="arrow left"
                onClick={goToPreviousSlide}
              />
              <img
                className="room-image"
                src={selectedRoom.images[currentSlide]}
                alt={`Room ${selectedRoom.name}`}
              />
              <IoIosArrowForward
                className="arrow right"
                onClick={goToNextSlide}
              />
            </div>

            <h2>{selectedRoom.name}</h2>
            <p>Type: {selectedRoom.type}</p>
            <p>Description: {selectedRoom.description}</p>
            <p>Price: R{selectedRoom.price}</p>
            <p>
              Capacity: {selectedRoom.adults} Adults, {selectedRoom.children}{' '}
              Children
            </p>

            <button onClick={openBookingModal}>Book</button>
          </div>
        </div>
      )}

      {bookingModalOpen && (
        <div className="booking-modal">
          <div className="booking-modal-content">
            <span className="close" onClick={closeModal}>
              <CgCloseO/>
            </span>
            {error && <p>{error}</p>}
            <h2>Booking Details</h2>
            <label htmlFor="checkInDate">Check-in Date:</label>
            <input
              type="date"
              id="checkInDate"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
            <label htmlFor="checkOutDate">Check-out Date:</label>
            <input
              type="date"
              id="checkOutDate"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
            />
            <button onClick={handleBooking}>Confirm price</button>
            <button
              onClick={() => setPaymentModalOpen(true)}
              disabled={!confirmPriceClicked}
            >
              Continue with payment
            </button>
            <p>Number of Nights: {numOfNights}</p> {/* Display the number of nights */}
            <p>Total Price: R{totalPrice}</p>
          </div>
        </div>
      )}

{paymentModalOpen && (
  <div className="payment-modal">
    <div className="payment-modal-content card-form">
      <span
        className="close"
        onClick={() => {
          setPaymentModalOpen(false);
          setConfirmPriceClicked(false); // Reset the state of the "Confirm price" button
          setError(null);
        }}
      >
        <CgCloseO/>
      </span>
      <h2>Payment Details</h2>
      {error && <p>{error}</p>}
      <form>
        <div className="form-group">
          <label htmlFor="cardNumber">Card Number:</label>
          <input
            type="text"
            id="cardNumber"
            pattern="[0-9]{13,19}"
            maxLength="19"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cardName">Cardholder Name:</label>
          <input
            type="text"
            id="cardName"
            pattern="[A-Za-z\s]+"
            maxLength="50"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date:</label>
          <input
            type="text"
            id="expiryDate"
            pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
            maxLength="5"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cvv">CVV:</label>
          <input
            type="text"
            id="cvv"
            pattern="[0-9]{3,4}"
            maxLength="4"
            required
          />
        </div>

        <button onClick={handlePayment}>Pay</button>
      </form>
    </div>
  </div>
)}
{paymentSuccessModalOpen && (
        <div className="payment-success-modal">
          <div className="payment-success-modal-content">
            <h2>Payment Successful!</h2>
            <button onClick={handlePaymentSuccessModalClose}>Close</button>
          </div>
        </div>
      )}

      {paymentFailureModalOpen && (
        <div className="payment-failure-modal">
          <div className="payment-failure-modal-content">
            <h2>Payment Failed!</h2>
            <button onClick={handlePaymentFailureModalClose}>Close</button>
          </div>
        </div>
      )}
<Footer/>
    </div>
    </div>
  );
};

export default Home;
