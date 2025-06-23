"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Book, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Echo {
  id: string;
  content: string;
  created_at: string;
}

const echoPrompts = [
  "What's a childhood memory that still makes you laugh?",
  "Describe a place where you feel completely at peace.",
  "What's something you learned about yourself recently?",
  "Tell me about a person who has influenced your life.",
  "What's a simple pleasure that you really appreciate?",
  "What's a challenge you overcame that you're proud of?",
  "Describe a perfect day from your perspective.",
  "What's something you're grateful for right now?",
  "What's a dream or goal that excites you?",
  "Tell me about a moment when you felt truly connected to someone."
];

export function Dashboard() {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [currentMemory, setCurrentMemory] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEchoes();
    generateNewPrompt();
  }, []);

  const fetchEchoes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/echoes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEchoes(data);
      }
    } catch (error) {
      console.error('Error fetching echoes:', error);
    }
  };

  const generateNewPrompt = () => {
    const randomPrompt = echoPrompts[Math.floor(Math.random() * echoPrompts.length)];
    setCurrentPrompt(randomPrompt);
  };

  const saveMemory = async () => {
    if (!currentMemory.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in again');
        return;
      }

      const response = await fetch('/api/echoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: currentMemory }),
      });

      if (response.ok) {
        const newEcho = await response.json();
        setEchoes([newEcho, ...echoes]);
        setCurrentMemory('');
        generateNewPrompt();
        toast.success('Memory saved!');
      } else {
        toast.error('Failed to save memory');
      }
    } catch (error) {
      console.error('Error saving memory:', error);
      toast.error('Failed to save memory');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboardingComplete');
    window.location.reload();
  };

  return (
    <div className="p-6 w-full h-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold text-gray-800">Echo</h1>
          </div>
          <button onClick={logout} className="neumorphic-button-light">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </motion.header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Memory Input Column */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-panel-light !bg-white/60 !border-white/20 !shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                Echo asks:
              </h2>
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="font-medium text-purple-800">{currentPrompt}</p>
              </div>
              
              <textarea
                placeholder="Share your memory..."
                value={currentMemory}
                onChange={(e) => setCurrentMemory(e.target.value)}
                className="w-full min-h-[150px] p-3 rounded-lg bg-white/50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-gray-800"
              />
              <div className="flex justify-between mt-4">
                <button onClick={generateNewPrompt} className="neumorphic-button-light">
                  New Prompt
                </button>
                <button 
                  onClick={saveMemory} 
                  disabled={!currentMemory.trim() || isLoading} 
                  className="neumorphic-button-light !bg-purple-600 !text-white !shadow-lg"
                >
                  {isLoading ? 'Saving...' : 'Save Memory'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Memory Timeline Column */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-panel-light !bg-white/60 !border-white/20 !shadow-xl h-full">
              <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                <Book className="h-5 w-5 text-purple-600 mr-2" />
                Your Memories
              </h2>
              <div className="h-[500px] overflow-y-auto pr-2 space-y-4">
                {echoes.length > 0 ? echoes.map((echo, index) => (
                  <motion.div
                    key={echo.id}
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/70 border border-gray-200 rounded-lg p-4"
                  >
                    <p className="text-gray-700 leading-relaxed">{echo.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(echo.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </motion.div>
                )) : (
                  <div className="text-center py-20">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No memories yet.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}