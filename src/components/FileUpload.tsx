import { useState, useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first!");

    const token = localStorage.getItem("jwtToken");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Upload successful!");
        setMessageType("success");
        onUploadSuccess();
      } else {
        setMessage("Upload failed.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="text-center relative">
      <h1 className="text-2xl font-bold text-gray-100 mb-4">Upload an Image</h1>
      <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-gray-700 bg-gray-800 rounded-lg shadow-sm justify-center">
        <label className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 cursor-pointer">
          {selectedFile ? selectedFile.name : "Choose file"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
        >
          {uploading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            "Upload"
          )}
        </button>
      </div>
      {message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg ${
            messageType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUpload;