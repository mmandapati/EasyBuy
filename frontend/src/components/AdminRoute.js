import React from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';
import { useContext } from 'react';

export default function AdminRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo && userInfo.isAdmin ? children : <Navigate to="/signin" />;
}
