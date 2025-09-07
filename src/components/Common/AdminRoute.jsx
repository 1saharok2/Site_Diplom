import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const {currentUser} = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace/>;
  }
  
  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;