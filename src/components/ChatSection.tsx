import { useRef, useEffect } from "react";
import { Message } from "../types/types";

interface ChatSectionProps {
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  isFetchingLLMResponse: boolean;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  isFetchingLLMResponse,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
  );
};

export default ChatSection;