"use client";

import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';

interface VoiceSearchProps {
    onResult: (transcript: string) => void;
}

export function VoiceSearch({ onResult }: VoiceSearchProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if browser supports Web Speech API
        setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    const handleVoiceSearch = () => {
        if (!isSupported) {
            alert('Voice search is not supported in your browser. Please try Chrome or Edge.');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);

            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access to use voice search.');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (!isSupported) {
        return null;
    }

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceSearch}
            disabled={isListening}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isListening
                    ? 'bg-destructive text-destructive-foreground'
                    : 'hover:bg-accent'
                }`}
            aria-label="Voice search"
        >
            {isListening ? (
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >
                    <MicOff className="w-5 h-5" />
                </motion.div>
            ) : (
                <Mic className="w-5 h-5" />
            )}
        </motion.button>
    );
}
