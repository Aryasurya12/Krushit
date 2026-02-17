'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mic, Send, VolumeX } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function AIChatbot() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    // FIXED: Load voices asynchronously
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
                console.log('🔊 Available voices loaded:', availableVoices.length);
                console.log('🔊 Languages available:', [...new Set(availableVoices.map(v => v.lang))]);
            };

            // Load voices immediately if available
            loadVoices();

            // Also listen for voiceschanged event (Chrome requirement)
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            // FIXED: Set language based on app language (using Indian English)
            const langMap: Record<string, string> = {
                en: 'en-IN',
                hi: 'hi-IN',
                mr: 'mr-IN'
            };
            recognitionRef.current.lang = langMap[i18n.language] || 'en-IN';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [i18n.language]);

    // FIXED: Text-to-speech function with proper voice selection
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Wait for voices to load if not yet available
            if (voices.length === 0) {
                console.warn('⚠️ Voices not loaded yet, retrying...');
                setTimeout(() => speak(text), 100);
                return;
            }

            const currentLang = i18n.language as 'en' | 'hi' | 'mr';

            // FIXED: Language code mapping
            const langMap: Record<string, string> = {
                en: 'en-IN',
                hi: 'hi-IN',
                mr: 'mr-IN'
            };
            const targetLangCode = langMap[currentLang] || 'en-IN';

            // FIXED: Select appropriate voice with fallback logic
            let selectedVoice: SpeechSynthesisVoice | undefined;

            // Try to find exact language match (e.g., hi-IN, mr-IN)
            selectedVoice = voices.find(voice => voice.lang === targetLangCode);

            // Fallback 1: Try language prefix match (e.g., hi, mr)
            if (!selectedVoice) {
                const langPrefix = targetLangCode.split('-')[0];
                selectedVoice = voices.find(voice => voice.lang.startsWith(langPrefix));
                console.log(`🔊 Using fallback voice for ${langPrefix}:`, selectedVoice?.name);
            }

            // Fallback 2: For Marathi, try Hindi voice
            if (!selectedVoice && currentLang === 'mr') {
                selectedVoice = voices.find(voice => voice.lang.startsWith('hi'));
                console.log('🔊 Marathi voice not found, using Hindi voice:', selectedVoice?.name);
            }

            // Fallback 3: Try any Indian English voice
            if (!selectedVoice && currentLang !== 'en') {
                selectedVoice = voices.find(voice => voice.lang.startsWith('en-IN'));
                console.log('🔊 Using English-IN fallback:', selectedVoice?.name);
            }

            // Fallback 4: Use any English voice
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
                console.log('🔊 Using default English voice:', selectedVoice?.name);
            }

            // FIXED: Handle long text by splitting into chunks
            const speakChunk = (chunk: string, isLast: boolean = false) => {
                const utterance = new SpeechSynthesisUtterance(chunk);

                // Set language and voice explicitly
                utterance.lang = targetLangCode;
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 1;

                utterance.onstart = () => {
                    if (!isSpeaking) setIsSpeaking(true);
                };

                utterance.onend = () => {
                    if (isLast) setIsSpeaking(false);
                };

                utterance.onerror = (event) => {
                    // Ignore normal interruptions (e.g., when new speech starts)
                    if (event.error === 'interrupted' || event.error === 'canceled') {
                        setIsSpeaking(false);
                        return;
                    }
                    console.warn('🔊 Speech warning:', event.error);
                    setIsSpeaking(false);
                };

                // FIX: Prevent garbage collection bug in some browsers
                // @ts-expect-error - Prevent garbage collection bug
                window.speechSynthesisUtterance = utterance;

                window.speechSynthesis.speak(utterance);
            };

            // FIXED: Split long text into sentences for better playback
            if (text.length > 200) {
                // Split by sentence boundaries
                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                sentences.forEach((sentence, index) => {
                    speakChunk(sentence.trim(), index === sentences.length - 1);
                });
            } else {
                speakChunk(text, true);
            }

            console.log(`🔊 Speaking in ${currentLang} (${targetLangCode}):`, text.substring(0, 50) + '...');
        }
    };

    // Stop speaking
    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    // Start voice input
    const startListening = () => {
        if (recognitionRef.current) {
            // FIXED: Update language dynamically before starting
            const langMap: Record<string, string> = {
                en: 'en-IN',
                hi: 'hi-IN',
                mr: 'mr-IN'
            };
            recognitionRef.current.lang = langMap[i18n.language] || 'en-IN';
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    // Stop voice input
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    // FIXED: Dynamic AI-powered response generator (calls FastAPI Backend)
    const getAIResponse = async (userMessage: string): Promise<string> => {
        const lang = i18n.language as 'en' | 'hi' | 'mr';

        try {
            console.log('🤖 Sending message to AI Backend (Port 8001)...');
            const response = await fetch('http://127.0.0.1:8001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    language: lang,
                    history: [] // Simplified for debugging
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend Error Status:', response.status, errorText);
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('🤖 Connection Error:', error);

            // Detailed fallback messages for UI
            const errorMessages: Record<string, string> = {
                en: `Connection Error: ${error.message}. Please ensure "python main.py" is running.`,
                hi: "कनेक्शन त्रुटि! कृपया सुनिश्चित करें कि बैकएंड चल रहा है।",
                mr: "कनेक्शन एरर! कृपया खात्री करा की बॅकएंड चालू आहे."
            };

            return errorMessages[lang] || errorMessages.en;
        }
    };



    // Send message
    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const userInput = input; // Store input before clearing
        setInput('');
        setIsTyping(true);

        // FIXED: Await AI response (dynamic, not hardcoded)
        try {
            const botResponse = await getAIResponse(userInput);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);

            // Auto-speak response
            speak(botResponse);
        } catch (error) {
            console.error('🤖 Error getting AI response:', error);
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-green-500/50 transition-all"
                    >
                        <MessageCircle size={24} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">AI Farm Assistant</h3>
                                    <p className="text-xs text-green-100">Always here to help</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    stopSpeaking();
                                }}
                                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MessageCircle className="text-green-600" size={32} />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1 font-semibold">Welcome to AI Assistant</p>
                                    <p className="text-xs text-gray-500">Ask me about watering, diseases, weather, or crop health</p>
                                </div>
                            )}

                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-800'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.text}</p>
                                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder={isListening ? 'Listening...' : 'Type your question...'}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        disabled={isListening}
                                    />
                                    <button
                                        onClick={isListening ? stopListening : startListening}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Mic size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={isSpeaking ? stopSpeaking : handleSend}
                                    disabled={!input.trim() && !isSpeaking}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSpeaking
                                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                                        : input.trim()
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isSpeaking ? <VolumeX size={18} /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
