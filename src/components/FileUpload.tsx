import { useState, useEffect } from "react";

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
        setMessage("Upload successful!");
        onUploadSuccess();
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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
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
  );
};

export default FileUpload;