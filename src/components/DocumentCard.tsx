import Image from "next/image";

interface DocumentCardProps {
  document: {
    id: string;
    imageUrl: string;
  };
  onClick: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  return (
    <div
      key={document.id}
      onClick={() => onClick(document.id)}
      className="relative group w-full h-0 pb-[141.4%] p-2 border-2 border-gray-700 bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 ease-in-out cursor-pointer overflow-hidden"
      style={{ aspectRatio: '1/1.414' }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <Image 
          src={document.imageUrl} 
          alt={`Document ${document.id}`} 
          width={210}
          height={297}
          style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%'
          }}
          className="rounded-sm transition-transform duration-200 group-hover:scale-95"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-2 right-2 text-xs font-medium text-white bg-black/30 px-2 py-1 rounded-full hidden group-hover:block transition-opacity">
        Click to view
      </span>
    </div>
  );
};

export default DocumentCard;