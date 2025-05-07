import React, { useState } from 'react';

function ImageUploadControl({ index, onImageSelect }) {
    const [selectedImage, setSelectedImage] = useState(null);
  
    const handleImageSelect = (event) => {
      const file = event.target.files[0];
      setSelectedImage(file);
      onImageSelect(index, file);
    }
  
    return (
        <div style={{ display: 'inline-block', margin: '10px' }}>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id={`imageInput-${index}`}
          onChange={handleImageSelect}
        />
        <label htmlFor={`imageInput-${index}`} style={{ cursor: 'pointer', border: '1px solid #ccc' }}>
          {selectedImage ? (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt={`Selected Image ${index + 1}`}
              style={{ width: '100px', height: '100px' }}
            />
          ) : (
            'Select Image'
          )}
        </label>
      </div>
    );
  }
export default ImageUploadControl;