"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import DocumentGallery from "../components/DocumentGallery";
import Loading from "../components/Loading";
import CustomError from "../components/CustomError";

interface Document {
  id: string;
  imageUrl: string;
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (!storedToken) {
      router.push("auth/login");
      return;
    }
    setToken(storedToken);
    fetchAllImages(storedToken);
  }, [router]);

  const fetchAllImages = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        setError("Failed to fetch images.");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Error fetching images.");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (id: string) => {
    router.push(`/document/${id}`);
  };

  if (loading) {
    if (token) {
      return <Loading message="Loading all documents..." />;
    } else {
      return <Loading message="Going to login page..." />;
    }
  }

  if (error) {
    return <CustomError error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <main className="flex flex-col gap-8 items-center">
        <FileUpload onUploadSuccess={() => fetchAllImages(token!)} />
        <DocumentGallery documents={documents} onDocumentClick={handleDocumentClick} />
      </main>
    </div>
  );
}