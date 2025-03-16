import Image from "next/image";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Document } from "../types/types";

interface DocumentSectionProps {
  document: Document;
  handleDownloadPDF: () => void;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ document, handleDownloadPDF }) => {
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
    </div>
  );
};

export default DocumentSection;