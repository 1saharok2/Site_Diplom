// components/Common/ProtectedCheckoutRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedCheckoutRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    // Сохраняем URL для редиректа после входа
    sessionStorage.setItem('redirectAfterLogin', '/checkout');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedCheckoutRoute;