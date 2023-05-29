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

SwiperCore.use([Navigation, Pagination, Autoplay]);

const HomeOffline = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const handleRoomCardClick = () => {
    setShowLoginModal(true);
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

      {showLoginModal && (
        // Render the login modal component here
        // You can replace the following line with your login modal component
        <div className="login-modal">Login Modal</div>
      )}

      <Footer />
    </div>
  );
};

export default HomeOffline;
