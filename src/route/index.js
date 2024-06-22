import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import User from '../pages/user';
import UserForm from '../pages/user/userForm';
import Properties from '../pages/properties';
import PropertyForm from '../pages/properties/form';
import Bookings from 'src/pages/booking';
import BookingForm from 'src/pages/booking/form';
import PropertyPrices from '../pages/propertyPrices';
import Login from '../pages/login';
import Payment from 'src/pages/payment';

function AppRoutes({ isAuthenticated }) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/user" /> : <Navigate to="/login" />
        }
      />
      <Route path="/login" element={<Login />} />
      {isAuthenticated ? (
        <>
          <Route path="/user" element={<User />} />
          <Route path="/user-form" element={<UserForm />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property-form" element={<PropertyForm />} />
          <Route path="/propertyPrices" element={<PropertyPrices />} />
          <Route path="/booking" element={<Bookings />} />
          <Route path="/booking-form" element={<BookingForm />} />
          <Route path="/payment" element={<Payment />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}

AppRoutes.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default AppRoutes;
