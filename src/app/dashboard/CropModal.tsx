"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from 'react-easy-crop';

interface CropModalProps {
  showCropModal: boolean;
  setShowCropModal: (v: boolean) => void;
  imageToCrop: string | null;
  setImageToCrop: (v: string | null) => void;
  crop: { x: number; y: number };
  setCrop: (v: { x: number; y: number }) => void;
  zoom: number;
  setZoom: (v: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  handleConfirmCrop: () => void;
}

export default function CropModal({
  showCropModal, setShowCropModal,
  imageToCrop, setImageToCrop,
  crop, setCrop,
  zoom, setZoom,
  onCropComplete,
  handleConfirmCrop
}: CropModalProps) {
  return (
    <AnimatePresence>
      {showCropModal && imageToCrop && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          className="fixed inset-0 bg-slate-200 z-[200] flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-2xl w-full flex flex-col gap-8">
            <div className="flex flex-col select-none">
              <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">
                Recadrage photo
              </span>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
                Ajuster l&apos;image
              </h3>
            </div>

            <div className="relative w-full h-[400px] md:h-[500px] bg-white rounded-3xl overflow-hidden border border-slate-300 shadow-sm">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Niveau de Zoom</span>
                  <span>{(zoom * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setImageToCrop(null);
                  }}
                  className="py-4 bg-white border border-slate-300 text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmCrop}
                  className="py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black shadow-xl transition-all"
                >
                  Confirmer le recadrage
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
