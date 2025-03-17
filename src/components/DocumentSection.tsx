import React, { useState } from "react";
import Image from "next/image";
import { ArrowDownTrayIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Document } from "../types/types";

interface DocumentSectionProps {
  document: Document;
  handleDownloadPDF: () => void;
  handleDocumentDelete: () => void;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ document, handleDownloadPDF, handleDocumentDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    handleDocumentDelete();
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <div className="relative aspect-video bg-gray-700 rounded-lg overflow-hidden">
          <Image
            src={document.imageUrl}
            alt={document.filename}
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-100">{document.filename}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Created at: {document.createdAt}</span>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {document.summary && (
            <div className="pt-4 border-t border-gray-700">
              <h2 className="text-lg font-semibold text-gray-200 mb-2">Summary</h2>
              <p className="text-gray-300 leading-relaxed">{document.summary}</p>
            </div>
          )}

          {document.text && (
            <div className="pt-4 border-t border-gray-700">
              <h2 className="text-lg font-semibold text-gray-200 mb-2">Full Text</h2>
              <pre className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {document.text}
              </pre>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Confirm Delete</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this document?</p>
            <div className="flex justify-end gap-4">
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSection;