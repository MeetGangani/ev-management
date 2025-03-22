import React, { useState } from 'react';
import { FaCar, FaUpload, FaTrash, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useReportDamageMutation } from '../slices/bookingsApiSlice';

const DamageReportForm = ({ bookingId, onComplete }) => {
  const [description, setDescription] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState(50);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [reportDamage, { isLoading }] = useReportDamageMutation();

  // Handle image upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Preview images
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please upload only image files (jpg, png, etc.)');
      return;
    }
    
    if (imageFiles.length + previewImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // Create preview URLs and update state
    const newPreviewImages = [...previewImages];
    const newImages = [...images];
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviewImages.push(reader.result);
        setPreviewImages([...newPreviewImages]);
      };
      reader.readAsDataURL(file);
      newImages.push(file);
    });
    
    setImages(newImages);
  };

  // Remove preview image
  const removeImage = (index) => {
    const updatedPreviewImages = [...previewImages];
    const updatedImages = [...images];
    
    updatedPreviewImages.splice(index, 1);
    updatedImages.splice(index, 1);
    
    setPreviewImages(updatedPreviewImages);
    setImages(updatedImages);
  };

  // Upload images to server and get URLs
  const uploadImageToServer = async (image) => {
    const formData = new FormData();
    formData.append('image', image);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        return data.imageUrl;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      throw new Error('Image upload failed');
    }
  };

  // Submit damage report
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description) {
      toast.error('Please provide a damage description');
      return;
    }
    
    if (penaltyAmount < 1) {
      toast.error('Penalty amount must be at least $1');
      return;
    }
    
    try {
      setUploading(true);
      
      // Upload all images and get URLs
      const imageUrls = [];
      if (images.length > 0) {
        for (const image of images) {
          const imageUrl = await uploadImageToServer(image);
          imageUrls.push(imageUrl);
        }
      }
      
      // Submit damage report
      const result = await reportDamage({
        id: bookingId,
        damageDescription: description,
        penaltyAmount: Number(penaltyAmount),
        images: imageUrls,
      }).unwrap();
      
      toast.success('Damage report submitted successfully');
      setUploading(false);
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      setUploading(false);
      toast.error(err?.data?.message || 'Failed to submit damage report');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="mb-4 flex items-center">
        <FaExclamationTriangle className="text-red-500 text-xl mr-2" />
        <h3 className="font-bold text-lg">Report Vehicle Damage</h3>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Damage Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the damage in detail..."
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="penaltyAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Penalty Amount ($)
          </label>
          <input
            id="penaltyAmount"
            type="number"
            min="1"
            step="1"
            value={penaltyAmount}
            onChange={(e) => setPenaltyAmount(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
          <p className="mt-1 text-sm text-gray-500">
            Set the penalty amount based on the extent of damage
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Damage Photos
          </label>
          <div className="mt-2 mb-3">
            <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-600 hover:bg-gray-50">
              <FaUpload className="mr-2" />
              <span>Click to add photos (max 5)</span>
              <input
                type="file"
                onChange={handleFileUpload}
                multiple
                accept="image/*"
                className="hidden"
                disabled={previewImages.length >= 5 || uploading}
              />
            </label>
          </div>
          
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {previewImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img 
                    src={img} 
                    alt={`Damage preview ${idx + 1}`} 
                    className="h-32 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={uploading}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button 
            type="button"
            onClick={() => onComplete && onComplete()}
            disabled={isLoading || uploading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading || uploading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading || uploading ? (
              <>
                <FaSpinner className="mr-2 animate-spin" /> 
                Processing...
              </>
            ) : (
              <>
                <FaCar className="mr-2" /> 
                Submit Damage Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DamageReportForm; 