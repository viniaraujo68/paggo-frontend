"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Document {
  id: string;
  imageUrl: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first!");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:3001/document/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Upload successful!");
        setImageUrl(data.imageUrl);  
        await fetchAllImages(); 
      } else {
        setMessage("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const fetchAllImages = async () => {
    try {
      const response = await fetch("http://localhost:3001/document/all");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data); 
      } else {
        setMessage("Failed to fetch images.");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setMessage("Error fetching images.");
    }
  };

  useEffect(() => {
    fetchAllImages();  // Fetch all images on page load
  }, []);

  const handleImageClick = (id: string) => {
    router.push(`/document/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <main className="flex flex-col gap-8 items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Upload an Image</h1>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-gray-700 bg-gray-800 rounded-lg shadow-sm justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="p-2 border border-gray-600 rounded bg-gray-700 text-gray-100"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="mt-2 text-lg text-gray-300">{message}</p>
        </div>

        <div className="mt-8 w-full max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-200 mb-4 pb-2 border-b border-gray-700">
            Document Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleImageClick(doc.id)}
                className="relative group w-full h-0 pb-[141.4%] p-2 border-2 border-gray-700 bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 ease-in-out cursor-pointer overflow-hidden"
                style={{ aspectRatio: '1/1.414' }} // A4 ratio (1:√2)
              >
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <Image 
                    src={doc.imageUrl} 
                    alt={`Document ${doc.id}`} 
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
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}