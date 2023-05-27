import React, { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaImage, FaEdit, FaSave } from 'react-icons/fa';
import './profile.css'; // Import CSS file for styling

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedSurname, setUpdatedSurname] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [updatedContactNumber, setUpdatedContactNumber] = useState('');
  const [updatedImage, setUpdatedImage] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (auth.currentUser) {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
            setUpdatedUsername(userDocSnap.data().email);
            
          }
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedImage(reader.result);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          username: updatedUsername,
          surname: updatedSurname,
          address: updatedAddress,
          contactNumber: updatedContactNumber,
          image: updatedImage,
        });
        setUserProfile({
          ...userProfile,
          username: updatedUsername,
          surname: updatedSurname,
          address: updatedAddress,
          contactNumber: updatedContactNumber,
          image: updatedImage,
        });
        setIsEditMode(false);
      }
    } catch (error) {
      console.log('Error updating user profile:', error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>

      {userProfile ? (
        <div className="user-profile">
          <td>
                  <img src={userProfile.image} alt="Profile" className="profile-image" />
                </td>
          <p>
            <FaEnvelope className="profile-icon" />
            Email: {userProfile.email}
          </p>
          <p>
            <FaUser className="profile-icon" />
            Username:
            {isEditMode ? (
              <input
                type="text"
                value={updatedUsername}
                onChange={(e) => setUpdatedUsername(e.target.value)}
              />
            ) : (
              <span>{userProfile.username}</span>
            )}
          </p>
          <p>
            <FaUser className="profile-icon" />
            Surname:
            {isEditMode ? (
              <input
                type="text"
                value={updatedSurname}
                onChange={(e) => setUpdatedSurname(e.target.value)}
              />
            ) : (
              <span>{userProfile.surname}</span>
            )}
          </p>
          <p>
            <FaHome className="profile-icon" />
            Address:
            {isEditMode ? (
              <input
                type="text"
                value={updatedAddress}
                onChange={(e) => setUpdatedAddress(e.target.value)}
              />
            ) : (
              <span>{userProfile.address}</span>
            )}
          </p>
          <p>
            <FaPhone className="profile-icon" />
            Contact Number:
            {isEditMode ? (
              <input
                type="text"
                value={updatedContactNumber}
                onChange={(e) => setUpdatedContactNumber(e.target.value)}
              />
            ) : (
              <span>{userProfile.contactNumber}</span>
            )}
          </p>
          <div className="image-upload">
            <label htmlFor="image-upload">
              <FaImage className="profile-icon" />
              Upload Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!isEditMode}
            />
            {previewImage && <img src={previewImage} alt="Profile" />}
          </div>
          <div className="edit-buttons">
            {isEditMode ? (
              <>
                <button className="save-button" onClick={handleUpdateProfile}>
                  <FaSave className="edit-icon" />
                  Save
                </button>
                <button className="cancel-button" onClick={() => setIsEditMode(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="edit-button" onClick={() => setIsEditMode(true)}>
                <FaEdit className="edit-icon" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
