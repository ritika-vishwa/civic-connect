import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { GlassCard } from './GlassCard';

interface ImageCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return null;

      // Set canvas size to the cropped size
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise<File>((resolve, reject) => {
        canvas.toBlob((file) => {
          if (file) {
            resolve(new File([file], 'avatar.jpg', { type: 'image/jpeg' }));
          } else {
            reject(new Error('Canvas is empty'));
          }
        }, 'image/jpeg');
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleSave = async () => {
    const file = await getCroppedImg();
    if (file) {
      onCropComplete(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-md p-6 border border-primary-container/30">
        <h3 className="font-display-lg text-2xl font-black text-white uppercase tracking-tight mb-4">Crop Avatar</h3>
        
        <div className="relative w-full h-64 bg-black/50 rounded-lg overflow-hidden border border-white/10 mb-6">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="mb-6">
          <label className="text-xs font-mono text-white/50 uppercase tracking-widest block mb-2">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary-container"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-label-caps text-xs tracking-widest uppercase transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl font-label-caps text-xs tracking-widest uppercase transition-all bg-primary-container/20 hover:bg-primary-container/30 text-primary-container border border-primary-container/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            Apply Crop
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
