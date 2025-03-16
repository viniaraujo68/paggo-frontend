import DocumentCard from "./DocumentCard";

interface DocumentGalleryProps {
  documents: {
    id: string;
    imageUrl: string;
  }[];
  onDocumentClick: (id: string) => void;
}

const DocumentGallery: React.FC<DocumentGalleryProps> = ({ documents, onDocumentClick }) => {
  return (
    <div className="mt-8 w-full max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 pb-2 border-b border-gray-700">
        Document Gallery
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onClick={onDocumentClick} />
        ))}
      </div>
    </div>
  );
};

export default DocumentGallery;