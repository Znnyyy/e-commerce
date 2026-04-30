import { useState } from 'react';

export const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'docs_upload_example_us_preset');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error('Cloudinary upload failed');
      return data.secure_url;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
};
