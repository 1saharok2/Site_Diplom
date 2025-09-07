import React from 'react';
import { Box } from '@mui/material';
import AdminSidebar from '../AdminLayout/AdminSidebar';
import AdminHeader from '../AdminLayout/AdminHeader';

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AdminHeader />
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;