"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

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

export default function ImageDetails() {
  const params = useParams();
  const imageId = params?.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageId) {
      fetchDocumentById(imageId);
    }
  }, [imageId]);

  const fetchDocumentById = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/document/${id}`);
      if (!response.ok) throw new Error("Failed to fetch document");
      
      const data = await response.json();
      
      // Convert image bytes to URL
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

    try {
      const response = await fetch(`http://localhost:3001/message/create/${imageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, order: messages.length + 1 }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
	if (chatContainerRef.current) {
	  chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.order % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className="flex-1 max-w-xs">
                  <div className={`bg-gray-700 rounded-xl p-4 transition-colors hover:bg-gray-600 ${message.order % 2 === 0 ? 'ml-0' : 'ml-auto'}`}>
                    <p className="text-gray-100">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(message.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} - {new Date(message.sentAt).toLocaleDateString([], {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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