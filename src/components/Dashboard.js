/**
 * Dashboard Component
 * Info cards with weather, time, news, etc.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Activity, FileText, MessageSquare, Cloud, CloudRain, Sun, Moon, CloudSnow, RefreshCw } from "lucide-react";

// Simple Weather Component
function SimpleWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      
      let lat = 12.9716;  // Bangalore default
      let lon = 77.5946;

      // Try to get user's location
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch (err) {
          console.log('Using Bangalore as default location');
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "602eb8e0d8f46c939889cdc2c5ad67ff";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) throw new Error('Failed to fetch weather');
      
      const data = await response.json();
      
      setWeather({
        city: data.name,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        time: new Date().toLocaleString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true 
        })
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return (
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud className="w-10 h-10 text-gray-400" />
      </motion.div>
    );
    
    const condition = weather.condition.toLowerCase();
    const isDay = weather.icon?.includes('d');
    
    if (condition.includes('clear')) {
      return isDay ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sun className="w-10 h-10 text-yellow-400" />
        </motion.div>
      ) : (
        <motion.div
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Moon className="w-10 h-10 text-blue-300" />
        </motion.div>
      );
    }
    if (condition.includes('rain')) {
      return (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudRain className="w-10 h-10 text-blue-400" />
        </motion.div>
      );
    }
    if (condition.includes('snow')) {
      return (
        <motion.div
          animate={{ 
            y: [0, -2, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudSnow className="w-10 h-10 text-blue-200" />
        </motion.div>
      );
    }
    // Cloudy
    return (
      <motion.div
        animate={{ 
          x: [0, 3, 0],
          opacity: [1, 0.9, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud className="w-10 h-10 text-gray-400" />
      </motion.div>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-zinc-800/50 w-64"
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-zinc-800/50 hover:border-zinc-700/50 transition-all w-64"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-shrink-0">
          {getWeatherIcon()}
        </div>
        <button
          onClick={fetchWeather}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-zinc-800/50"
          aria-label="Refresh weather"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {weather && (
        <div className="space-y-1">
          <div className="text-4xl font-light text-white tracking-tight">
            {weather.temp}°
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>{weather.city}</span>
          </div>
          <div className="text-xs text-gray-500">
            {weather.time}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ conversations: 0, documents: 0 });

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const savedNotes = localStorage.getItem("jarvis_notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    // Fetch real stats
    fetchStats();

    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch documents count
      const docsResponse = await fetch('/api/documents');
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setStats(prev => ({ ...prev, documents: docsData.documents?.length || 0 }));
      }

      // Fetch conversations count
      const historyResponse = await fetch('/api/history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setStats(prev => ({ ...prev, conversations: historyData.conversations?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    const updatedNotes = [
      ...notes,
      { id: Date.now(), text: newNote, created: new Date() },
    ];
    setNotes(updatedNotes);
    localStorage.setItem("jarvis_notes", JSON.stringify(updatedNotes));
    setNewNote("");
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("jarvis_notes", JSON.stringify(updatedNotes));
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back! Here's what's happening today.
          </p>
        </motion.div>

        {/* Weather and Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Weather Widget */}
          <SimpleWeather />
          
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-zinc-800/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:border-blue-500/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Conversations</p>
                <p className="text-3xl font-bold text-blue-400">{stats.conversations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/20">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-zinc-800/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all hover:border-green-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Documents</p>
                <p className="text-3xl font-bold text-green-400">{stats.documents}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center border border-green-500/20">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-zinc-800/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all hover:border-orange-500/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Quick Notes</p>
                <p className="text-3xl font-bold text-orange-400">{notes.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-900/30 rounded-full flex items-center justify-center border border-orange-500/20">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 rounded-2xl p-6 shadow-lg border border-zinc-800"
        >
          <h3 className="text-xl font-semibold mb-4 text-white">Quick Notes</h3>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addNote()}
              placeholder="Add a quick note..."
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700"
            />
            <button
              onClick={addNote}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
            >
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No notes yet. Add one to get started!
              </p>
            ) : (
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  <span className="text-sm text-white">{note.text}</span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="ml-4 text-red-400 hover:text-red-300 text-lg font-bold px-2"
                  >
                    ✕
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
