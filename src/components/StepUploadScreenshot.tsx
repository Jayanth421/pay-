'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  CheckCircle,
  FileCheck,
} from 'lucide-react';

interface StepUploadScreenshotProps {
  paymentReference: string;
  onBack: () => void;
  onUploadSuccess: (ref: string) => void;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function StepUploadScreenshot({
  paymentReference,
  onBack,
  onUploadSuccess,
}: StepUploadScreenshotProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(
        'Invalid format. Please upload a JPG, PNG, or WebP screenshot.'
      );
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(
          1
        )} MB). Maximum allowed size is 5 MB.`
      );
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a payment screenshot.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('screenshot', selectedFile);
      formData.append('payment_reference', paymentReference);

      const res = await fetch('/api/donation/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onUploadSuccess(paymentReference);
      } else {
        setErrorMessage(data.message || 'Failed to upload screenshot.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage('Network error while uploading. Please retry.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_#000] p-6 sm:p-8 transition-all">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB7185] border-2 border-black text-xs font-black mb-2 shadow-[2px_2px_0px_#000]">
          <span>Proof Submission</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
          Upload Payment Screenshot
        </h2>
        <p className="text-xs sm:text-sm font-bold text-zinc-600 mt-1">
          Upload a clear screenshot showing the successful transaction for reference{' '}
          <strong className="text-black font-mono underline decoration-2">
            {paymentReference}
          </strong>
          .
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop Zone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-[2.5px] border-dashed border-black rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'bg-[#FEFCE8] shadow-[5px_5px_0px_#000] scale-[1.01]'
                : 'bg-[#FAF9F6] hover:bg-[#FEFCE8] shadow-[3px_3px_0px_#000]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="screenshot-input"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#FFDE59] border-2 border-black text-black flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_#000]">
              <UploadCloud className="w-7 h-7 stroke-[2.5]" />
            </div>
            <p className="text-base font-black text-black">
              Click to browse or drop screenshot
            </p>
            <p className="text-xs font-bold text-zinc-500 mt-1">
              Accepts JPG, PNG, WebP (up to 5 MB)
            </p>
          </div>
        ) : (
          /* Preview Box with Neo-Brutalist Frame */
          <div className="rounded-2xl border-[2.5px] border-black overflow-hidden bg-white shadow-[4px_4px_0px_#000] relative">
            <div className="p-3 bg-[#FAF9F6] border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <FileCheck className="w-4 h-4 text-[#15803d] stroke-[2.5] shrink-0" />
                <span className="text-xs font-black text-black truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] font-bold text-zinc-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={uploading}
                className="p-1 rounded-lg bg-white border border-black hover:bg-rose-100 text-black transition cursor-pointer"
                title="Remove file"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-4 flex justify-center bg-zinc-100 max-h-72 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl!}
                alt="Payment proof preview"
                className="max-h-64 rounded-xl object-contain border-2 border-black shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div
            id="upload-error-alert"
            className="p-3.5 rounded-2xl bg-[#FEE2E2] border-2 border-black shadow-[3px_3px_0px_#000] text-black text-xs font-bold flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Security Note */}
        <div className="text-xs font-bold text-zinc-600 bg-[#FAF9F6] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2">
          <FileImage className="w-4 h-4 text-black shrink-0" />
          <span>
            Screenshot will be securely placed in a private storage bucket for administrator verification.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={uploading}
            className="py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Back</span>
          </button>

          <button
            id="submit-screenshot-btn"
            type="submit"
            disabled={uploading || !selectedFile}
            className="flex-1 py-3.5 px-6 rounded-xl bg-[#4ADE80] hover:bg-[#22c55e] disabled:bg-zinc-200 text-black font-black text-sm border-[2.5px] border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Screenshot...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Submit Screenshot</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
