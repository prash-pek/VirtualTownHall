import { motion } from 'framer-motion';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-0.5 text-white text-xs font-bold"
          style={{ background: 'var(--navy)' }}
        >
          AI
        </div>
      )}
      <div
        className="max-w-[78%] px-4 py-3"
        style={{
          background: isUser ? 'var(--navy)' : 'white',
          color: isUser ? 'white' : 'var(--ink)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className="text-xs mt-1.5 opacity-50">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
