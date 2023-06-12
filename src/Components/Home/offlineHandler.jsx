import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../config/firebase';
import {
  collection,
  getDocs,
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

import 'swiper/swiper.min.css';

import Footer from '../Footer/footer';
import Loader from '../Loader/Loader';
import Login from '../Login/login';
import Signup from '../Signup/signup';

SwiperCore.use([Navigation, Pagination, Autoplay]);

const HomeOffline = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(null); // 'login' or 'signup'

  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);

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

  const goToPrevious = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
      swiperRef.current.swiper.autoplay.start();
    }
  };

  const goToNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
      swiperRef.current.swiper.autoplay.start();
    }
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

  const handleRoomCardClick = () => {
    setActiveStep('login');
  };

  const handleSwitchToSignup = () => {
    setActiveStep('signup');
  };

  const handleSwitchToLogin = () => {
    setActiveStep('login');
  };

  const handleCloseModal = () => {
    setActiveStep(null);
  };

  return (
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

      {error && <p className="error-message">{error}</p>}

      <div className="room-container">
        {isLoading ? (
          <Loader />
        ) : (
          rooms.map((room, index) => (
            <div
              className="room-card"
              key={room.id}
              onClick={handleRoomCardClick}
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
          ))
        )}
      </div>

      {activeStep && (
  <div className="auth-modal">
    <button className="close-button" onClick={handleCloseModal}>x</button>
    {activeStep === 'signup' ? (
      <>
        <Signup handleSwitchToLogin={handleSwitchToLogin} />
      </>
    ) : (
      <>
        <Login handleSwitchToSignup={handleSwitchToSignup} />
      </>
    )}
  </div>
)}




      <Footer />
    </div>
  );
};

export default HomeOffline;
