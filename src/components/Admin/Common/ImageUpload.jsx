// components/Admin/Common/ImageUpload.jsx
import React, { useCallback } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import { CloudUpload, Delete, AddPhotoAlternate } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ onImageUpload, onImageRemove, images = [], existingImages = [] }) => {
  const onDrop = useCallback((acceptedFiles) => {
    onImageUpload(acceptedFiles);
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  return (
    <Box>
      {/* Область загрузки */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          mb: 3
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
        <Typography variant="h6">
          {isDragActive ? 'Отпустите для загрузки' : 'Перетащите изображения сюда или нажмите'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Поддерживаются JPG, PNG, GIF, WEBP (макс. 10MB)
        </Typography>
        <Button variant="outlined" startIcon={<AddPhotoAlternate />} sx={{ mt: 2 }}>
          Выбрать файлы
        </Button>
      </Paper>

      {/* Предпросмотр изображений */}
      {(existingImages.length > 0 || images.length > 0) && (
        <Grid container spacing={2}>
          {/* Существующие изображения */}
          {existingImages.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Box sx={{ position: 'relative' }}>
                <Paper sx={{ p: 1 }}>
                  <img
                    src={image.url || image}
                    alt={`Existing ${index}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'background.paper'
                    }}
                    onClick={() => onImageRemove(index, true)}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              </Box>
            </Grid>
          ))}

          {/* Новые изображения */}
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Box sx={{ position: 'relative' }}>
                <Paper sx={{ p: 1 }}>
                  <img
                    src={image.preview}
                    alt={`Preview ${index}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'background.paper'
                    }}
                    onClick={() => onImageRemove(index, false)}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUpload;