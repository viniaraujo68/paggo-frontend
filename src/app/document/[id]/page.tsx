"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import jsPDF from "jspdf";

interface Document {
  id: string;
  filename: string;
  createdAt: string;
  summary: string;
  text: string;
  imageUrl: string;
}

interface Message {
  id: string;
  content: string;
  order: number;
  sentAt: string;
}

export default function DocumentDetails() {
  const params = useParams();
  const imageId = params?.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isFetchingLLMResponse, setIsFetchingLLMResponse] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
  
	// Create a message object to be added immediately to the chat
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

  const scrollToBottom = () => {
	if (chatContainerRef.current) {
	  chatContainerRef.current.scrollTo({
		top: chatContainerRef.current.scrollHeight,
		behavior: 'smooth',
	  });
	}
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          Loading document details...
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 gap-5">
        <div className="text-red-400 text-lg font-medium">
          {error || "Document not found"}
        </div>
        <Link
          href="/"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          ← Return to Home
        </Link>
      </div>
    );
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
        {/* Document Section */}
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

        {/* Chat Section */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 h-[calc(100vh-160px)] flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-gray-200">Document Chat</h2>
            <p className="text-sm text-gray-400 mt-1">Ask questions about this document</p>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages
              .sort((a, b) => a.order - b.order)
              .map((message) => (
                <div
                  key={message.id || `${message.order}`}
                  className={`flex items-start gap-3 ${message.order % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="flex-1 max-w-xs">
                    <div className={`bg-gray-700 rounded-xl p-4 transition-colors hover:bg-gray-600 ${message.order % 2 === 0 ? 'ml-0' : 'ml-auto'}`}>
                      <p className="text-gray-100">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {message.sentAt && `${new Date(message.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - ${new Date(message.sentAt).toLocaleDateString([], {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            {isFetchingLLMResponse && (
              <div className="flex justify-center">
                <div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 outline-none transition-all placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
