"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import DocumentSection from "../../../components/DocumentSection";
import ChatSection from "../../../components/ChatSection";
import Loading from "../../../components/Loading";
import CustomError from "../../../components/CustomError";
import { Document, Message } from "../../../types/types";

export default function DocumentDetails() {
  const params = useParams();
  const imageId = params?.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isFetchingLLMResponse, setIsFetchingLLMResponse] = useState(false);

  useEffect(() => {
    if (imageId) {
      fetchDocumentById(imageId);
    }
  }, [imageId]);

  const handleDownloadPDF = () => {
    if (!document || !messages) return;

    const doc = new jsPDF();
    doc.setFont("helvetica");

    doc.setFontSize(18);
    doc.text(`Document: ${document.filename}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Created at: ${document.createdAt}`, 20, 30);

    let yPosition = 45;
    const pageHeight = doc.internal.pageSize.getHeight();

    const checkPageEnd = (additionalHeight = 0) => {
        if (yPosition + additionalHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }
    };

    if (document.imageUrl) {
        const imgWidth = 100; 
        const imgHeight = 130;
        checkPageEnd(imgHeight + 10);
        doc.addImage(document.imageUrl, "JPEG", 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255);
    checkPageEnd(20);
    doc.text("Summary:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const splitSummary = doc.splitTextToSize(document.summary || "No summary available", 170);
    checkPageEnd(splitSummary.length * 5 + 10);
    doc.text(splitSummary, 20, yPosition);
    yPosition += splitSummary.length * 5 + 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255);
    checkPageEnd(20);
    doc.text("Full Text:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(document.text || "No text available", 170);
    checkPageEnd(splitText.length * 5 + 10);
    doc.text(splitText, 20, yPosition);
    yPosition += splitText.length * 5 + 10;

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 255);
    checkPageEnd(30);
    doc.text("Chat History", 20, yPosition);
    yPosition += 10;

    messages
        .sort((a, b) => a.order - b.order)
        .forEach((message) => {
            checkPageEnd(30);
            doc.setFontSize(12);
            
            doc.setTextColor(0, 0, 0);
            const label = message.order % 2 !== 0 ? "Question" : "Answer";

            doc.text(`${label}:`, 20, yPosition);

            doc.setFontSize(11);
            const splitMessage = doc.splitTextToSize(message.content, 170);
            checkPageEnd(splitMessage.length * 5 + 15);
            doc.text(splitMessage, 20, yPosition + 5);

            const date = new Date(message.sentAt).toLocaleString();
            doc.setTextColor(156, 163, 175);
            doc.setFontSize(9);
            checkPageEnd(10);
            doc.text(date, 20, yPosition + 5 + splitMessage.length * 5);

            yPosition += 15 + splitMessage.length * 5;
        });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`${document.filename}-report.pdf`);
  };

  const fetchDocumentById = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/document/${id}`);
      if (!response.ok) throw new Error("Failed to fetch document");

      const data = await response.json();

      const uint8Array = new Uint8Array(Object.values(data.image));
      const blob = new Blob([uint8Array], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);

      setDocument({
        id: data.id,
        filename: data.filename,
        createdAt: new Date(data.createdAt).toLocaleString(),
        summary: data.summary,
        text: data.text,
        imageUrl,
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      setError(error instanceof Error ? error.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/message/${imageId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      console.log('Received messages:', data);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageData: Message = {
      id: Date.now().toString(),
      content: newMessage,
      order: messages.length + 1,
      sentAt: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessageData]);
    setIsFetchingLLMResponse(true);
    setNewMessage("");

    try {
      const response = await fetch(`http://localhost:3001/message/create/${imageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, order: messages.length + 1 }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      fetchMessages();
      setIsFetchingLLMResponse(false);

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return <Loading message="Loading Document Details..." />;
  }

  if (error || !document) {
    return <CustomError error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
      >
        ← Back to Documents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <DocumentSection document={document} handleDownloadPDF={handleDownloadPDF} />
        <ChatSection
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          isFetchingLLMResponse={isFetchingLLMResponse}
        />
      </div>
    </div>
  );
}