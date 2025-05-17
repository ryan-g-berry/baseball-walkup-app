import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Plus, Edit, Trash2, Save, X, Search, ChevronUp, ChevronDown, Menu, Upload, Volume2, MoreVertical, StopCircle } from 'lucide-react';

function App() {
  // App state
  const [activeTab, setActiveTab] = useState('lineup');
  const [players, setPlayers] = useState([]);
  const [gameLineup, setGameLineup] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [localAudioFiles, setLocalAudioFiles] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(null); // New state for dropdown menu
  const audioRef = useRef(null);
  
  // Load saved data when the app starts
  useEffect(() => {
    console.log("App initialized, loading data");
    loadDataFromStorage();
  }, []);
  
  const loadDataFromStorage = () => {
    try {
      // Load players
      const savedPlayers = localStorage.getItem('walkupPlayers');
      if (savedPlayers) {
        const parsedPlayers = JSON.parse(savedPlayers);
        console.log("Loaded players from storage:", parsedPlayers);
        if (Array.isArray(parsedPlayers) && parsedPlayers.length > 0) {
          setPlayers(parsedPlayers);
        } else {
          console.log("Saved players array was empty or invalid, loading sample data");
          loadSampleData();
        }
      } else {
        console.log("No saved players found, loading sample data");
        loadSampleData();
      }
      
      // Load lineup
      const savedLineup = localStorage.getItem('walkupLineup');
      if (savedLineup) {
        const parsedLineup = JSON.parse(savedLineup);
        console.log("Loaded lineup from storage:", parsedLineup);
        if (Array.isArray(parsedLineup)) {
          setGameLineup(parsedLineup);
        }
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading data from storage:", error);
      loadSampleData();
    }
  };
  
  // Load sample data function
  const loadSampleData = () => {
    console.log("Loading sample data");
    const samplePlayers = [
      { id: '1', name: 'Alex Johnson', number: '7', walkupMusic: { 
        source: 'spotify', 
        title: 'Eye of the Tiger - Survivor', 
        url: 'https://open.spotify.com/embed/track/2KH16WveTQWT6KOG9Rg6e2', 
        startTime: 15, 
        endTime: 30,
        fileId: null
      }},
      { id: '2', name: 'Brandon Smith', number: '12', walkupMusic: { 
        source: 'youtube', 
        title: 'We Will Rock You - Queen',
        url: 'https://www.youtube.com/embed/zBUJztI884M', 
        startTime: 0, 
        endTime: 15,
        fileId: null
      }},
      { id: '3', name: 'Carlos Rodriguez', number: '24', walkupMusic: { 
        source: 'spotify', 
        title: 'Start Me Up - Rolling Stones',
        url: 'https://open.spotify.com/embed/track/4JiEyzf0Md7KEFFGWDDdCr', 
        startTime: 5, 
        endTime: 20,
        fileId: null
      }},
      { id: '4', name: 'Daniel Wilson', number: '3', walkupMusic: { 
        source: 'youtube', 
        title: 'Welcome to the Jungle - Guns N\' Roses',
        url: 'https://www.youtube.com/embed/o1tj2zJ2Wvg', 
        startTime: 30, 
        endTime: 45,
        fileId: null
      }},
      { id: '5', name: 'Ethan Brown', number: '18', walkupMusic: { 
        source: 'spotify', 
        title: 'Thunderstruck - AC/DC',
        url: 'https://open.spotify.com/embed/track/57bgtoPSgt236HzfBOd8kj', 
        startTime: 10, 
        endTime: 25,
        fileId: null
      }},
    ];
    setPlayers(samplePlayers);
    
    // Save sample data to localStorage immediately
    try {
      localStorage.setItem('walkupPlayers', JSON.stringify(samplePlayers));
      console.log("Sample data saved to localStorage");
    } catch (error) {
      console.error("Error saving sample data to localStorage:", error);
    }
  };
  
  // Save players data whenever it changes
  useEffect(() => {
    if (!dataLoaded) return; // Don't save during initial load
    
    console.log("Saving players to localStorage:", players);
    try {
      localStorage.setItem('walkupPlayers', JSON.stringify(players));
    } catch (error) {
      console.error("Error saving players to localStorage:", error);
    }
  }, [players, dataLoaded]);
  
  // Save lineup data whenever it changes
  useEffect(() => {
    if (!dataLoaded) return; // Don't save during initial load
    
    console.log("Saving lineup to localStorage:", gameLineup);
    try {
      localStorage.setItem('walkupLineup', JSON.stringify(gameLineup));
    } catch (error) {
      console.error("Error saving lineup to localStorage:", error);
    }
  }, [gameLineup, dataLoaded]);
  
  // Update available players when the full roster changes
  useEffect(() => {
    updateAvailablePlayers();
  }, [players, gameLineup]);
  
  // This helps with browser autoplay policies
  useEffect(() => {
    const handleUserInteraction = () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      
      // Pre-create an audio context to unlock audio on iOS
      if (audioRef.current) {
        const silentPlay = () => {
          audioRef.current.volume = 0.01;
          audioRef.current.play().catch(e => console.log('Silent play failed, this is normal'));
          audioRef.current.pause();
          audioRef.current.volume = 1;
        };
        silentPlay();
      }
      
      console.log('User interaction detected - audio should now be enabled');
    };
    
    // Add listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);
  
  // Function to update available players list (players not in lineup)
  const updateAvailablePlayers = () => {
    const lineupIds = gameLineup.map(p => p.id);
    const available = players.filter(player => !lineupIds.includes(player.id));
    setAvailablePlayers(available);
  };
  
  // Process a URL based on source
  const processURL = (url, source) => {
    // For Spotify
    if (source === 'spotify') {
      // Convert normal Spotify URLs to embed URLs if needed
      if (url.includes('open.spotify.com/track/')) {
        const trackId = url.split('track/')[1].split('?')[0];
        return `https://open.spotify.com/embed/track/${trackId}`;
      } else if (url.includes('spotify:track:')) {
        const trackId = url.split('spotify:track:')[1];
        return `https://open.spotify.com/embed/track/${trackId}`;
      }
      // If it's already an embed URL, return as is
      if (url.includes('open.spotify.com/embed/')) {
        return url;
      }
      return url;
    } 
    // For YouTube
    else if (source === 'youtube') {
      // Convert normal YouTube URLs to embed URLs if needed
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    }
    return url;
  };
  
  // Prevent navigation when clicking links in iframes
  const preventNavigation = (e) => {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      e.preventDefault();
      return false;
    }
  };
  
  // Add event listeners to iframes to prevent navigation
  useEffect(() => {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.addEventListener('load', () => {
        try {
          iframe.contentDocument.addEventListener('click', preventNavigation, true);
        } catch (e) {
          // Cross-origin access might be restricted
          console.log('Could not add event listener to iframe content - this is normal for cross-origin iframes');
        }
      });
    });
    
    return () => {
      iframes.forEach(iframe => {
        try {
          iframe.contentDocument.removeEventListener('click', preventNavigation, true);
        } catch (e) {
          // Cross-origin access might be restricted
        }
      });
    };
  }, [currentPlayer, previewData]);
  
  // Add a more direct approach to click the Spotify play button via JavaScript
  useEffect(() => {
    if (currentPlayer && currentPlayer.walkupMusic.source === 'spotify' && isPlaying) {
      // A series of delays to try clicking the play button
      const delays = [1000, 1500, 2000, 3000];
      
      // Click handler function
      const clickPlayButton = () => {
        try {
          // Try to find and click the play button in various ways
          // Method 1: Direct button click via class name
          const playButtons = document.querySelectorAll('button[data-testid="play-button"], .SpotifyPlayer button, [aria-label="Play"], .control-button-play');
          
          if (playButtons.length > 0) {
            playButtons.forEach(button => {
              console.log('Found Spotify play button, clicking:', button);
              button.click();
            });
          }
          
          // Method 2: Dispatch a keyboard event to try to trigger play
          document.dispatchEvent(new KeyboardEvent('keydown', {
            key: ' ',
            keyCode: 32,
            which: 32,
            bubbles: true
          }));
        } catch (e) {
          console.error('Error trying to auto-play Spotify:', e);
        }
      };
      
      // Set multiple timeouts at different delays to try clicking the play button
      const timers = delays.map(delay => setTimeout(clickPlayButton, delay));
      
      return () => {
        // Clear all timeouts on cleanup
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [currentPlayer, isPlaying]);
  
  // Extract Spotify track ID from URL
  const extractSpotifyTrackId = (url) => {
    if (!url) return null;
    // Handle various Spotify URL formats
    if (url.includes('/track/')) {
      return url.split('/track/')[1].split('?')[0].split('/')[0];
    } else if (url.includes(':track:')) {
      return url.split(':track:')[1].split('?')[0].split(':')[0];
    }
    return null;
  };

  // Handle player announcement and music with special Spotify handling
  const announcePlayer = (player) => {
    setCurrentPlayer(player);
    setIsPlaying(true);
    
    // For local files, play the audio element
    if (player.walkupMusic.source === 'local' && audioRef.current) {
      const fileId = player.walkupMusic.fileId;
      if (localAudioFiles[fileId]) {
        const audio = audioRef.current;
        audio.src = URL.createObjectURL(localAudioFiles[fileId]);
        audio.currentTime = player.walkupMusic.startTime;
        
        // For local files only, we'll need to handle the end time
        const duration = player.walkupMusic.endTime - player.walkupMusic.startTime;
        
        // Add an event listener to make sure it plays
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio playback failed:', error);
          });
        }
        
        // Only for local files: stop after duration
        setTimeout(() => {
          audio.pause();
        }, duration * 1000);
      }
    }
    
    // For Spotify, we now handle in the useEffect with a reload after a delay
    
    // YouTube uses autoplay parameter in iframe
  };
  
  // Stop playback manually and reset to start position
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPlayer(null);
    
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // New function for stopping a specific player's music
  const stopPlayerMusic = (player) => {
    // If this is not the currently playing player, do nothing
    if (!currentPlayer || currentPlayer.id !== player.id) return;

    stopPlayback();
  };
  
  // Drag and drop functionality
  const handleDragStart = (player) => {
    setIsDragging(true);
    setDraggedPlayer(player);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  
  const handleDrop = (index) => {
    // Get current position of player if already in lineup
    const currentIndex = gameLineup.findIndex(p => p.id === draggedPlayer.id);
    
    // Create a new array to modify
    const newLineup = [...gameLineup];
    
    if (currentIndex > -1) {
      // Player already in lineup, reorder
      newLineup.splice(currentIndex, 1); // Remove from current position
      if (index > currentIndex) index--; // Adjust index if needed
      newLineup.splice(index, 0, draggedPlayer); // Add at new position
    } else {
      // Player not in lineup, add to lineup
      newLineup.splice(index, 0, draggedPlayer);
    }
    
    setGameLineup(newLineup);
    setIsDragging(false);
    setDraggedPlayer(null);
    setDragOverIndex(null);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedPlayer(null);
    setDragOverIndex(null);
  };
  
  // Preview music selection
  const previewMusic = (musicData) => {
    setPreviewData(musicData);
    setShowPreview(true);
    
    // If it's a local file, play it using audio element
    if (musicData.source === 'local' && audioRef.current && localAudioFiles[musicData.fileId]) {
      const audio = audioRef.current;
      audio.src = URL.createObjectURL(localAudioFiles[musicData.fileId]);
      audio.currentTime = musicData.startTime;
      
      // For local files, we need to handle start/end time manually
      const duration = musicData.endTime - musicData.startTime;
      
      // Add an event listener to make sure it plays
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Audio playback failed:', error);
        });
      }
      
      // Only for local files: stop after duration
      setTimeout(() => {
        audio.pause();
      }, duration * 1000);
    }
    
    // For Spotify and YouTube, we don't need to set any timers
    // The embedded players will handle playback
  };
  
  // Handle local file uploads
  const handleFileUpload = (file, callback) => {
    if (file && file.type.includes('audio')) {
      // Generate a unique ID for this file
      const fileId = `file_${Date.now()}`;
      
      // Store the file in state
      setLocalAudioFiles(prevFiles => ({
        ...prevFiles,
        [fileId]: file
      }));
      
      // Call the callback with the file info
      callback({
        fileId: fileId,
        name: file.name
      });
    }
  };
  
  // Add player to lineup
  const addToLineup = (player) => {
    if (!gameLineup.find(p => p.id === player.id)) {
      setGameLineup([...gameLineup, player]);
    }
  };

  // Remove player from lineup
  const removeFromLineup = (playerId) => {
    setGameLineup(gameLineup.filter(player => player.id !== playerId));
    // Close any open dropdown menu
    setDropdownMenuOpen(null);
  };

  // Toggle dropdown menu
  const toggleDropdownMenu = (playerId) => {
    if (dropdownMenuOpen === playerId) {
      setDropdownMenuOpen(null);
    } else {
      setDropdownMenuOpen(playerId);
    }
  };
  
  // Save player handler
  const handleSavePlayer = (playerData) => {
    let url = playerData.walkupMusic.title;
    let fileId = null;
    
    // Handle based on source
    if (playerData.walkupMusic.source === 'spotify' || playerData.walkupMusic.source === 'youtube') {
      // Format URLs properly for embedding
      url = processURL(url, playerData.walkupMusic.source);
    } else if (playerData.walkupMusic.source === 'local') {
      // For local files, we'll use the fileId to reference the stored file
      fileId = playerData.walkupMusic.fileId;
      url = '';
    }
    
    const updatedPlayer = {
      id: editingPlayer ? editingPlayer.id : Date.now().toString(),
      name: playerData.name,
      number: playerData.number,
      walkupMusic: {
        source: playerData.walkupMusic.source,
        title: playerData.walkupMusic.artist, // Using the artist field for the display title
        url: url,
        fileId: fileId,
        startTime: parseInt(playerData.walkupMusic.startTime),
        endTime: parseInt(playerData.walkupMusic.endTime)
      }
    };
    
    if (editingPlayer) {
      // Update existing player
      setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
      // Update in lineup if present
      setGameLineup(gameLineup.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    } else {
      // Add new player
      setPlayers([...players, updatedPlayer]);
    }
    
    setEditingPlayer(null);
    setShowAddPlayer(false);
  };

  // Filter players based on search query
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.number.includes(searchQuery)
  );
  
  // Player Editor Component
  const PlayerEditor = () => {
    const [name, setName] = useState(editingPlayer?.name || '');
    const [number, setNumber] = useState(editingPlayer?.number || '');
    const [musicSource, setMusicSource] = useState(editingPlayer?.walkupMusic?.source || 'spotify');
    const [musicTitle, setMusicTitle] = useState(editingPlayer?.walkupMusic?.url || '');
    const [musicDisplayTitle, setMusicDisplayTitle] = useState(editingPlayer?.walkupMusic?.title || '');
    const [startTime, setStartTime] = useState(editingPlayer?.walkupMusic?.startTime || 0);
    const [endTime, setEndTime] = useState(editingPlayer?.walkupMusic?.endTime || 15);
    const [localFile, setLocalFile] = useState({
      fileId: editingPlayer?.walkupMusic?.fileId || null,
      name: editingPlayer?.walkupMusic?.title || null
    });
    const [isPreviewActive, setIsPreviewActive] = useState(false);
    
    // Format a URL for preview (non-embedded format for display)
    const getDisplayUrl = () => {
      if (musicSource === 'local') {
        return localFile.name || 'No file selected';
      }
      return musicTitle;
    };
    
    // Preview the current selection
    const handlePreview = () => {
      if (musicSource === 'local' && !localFile.fileId) {
        alert('Please upload a file first');
        return;
      }
      
      if ((musicSource === 'spotify' || musicSource === 'youtube') && !musicTitle) {
        alert('Please enter a URL first');
        return;
      }
      
      setIsPreviewActive(true);
      
      // Prepare preview data
      const previewData = {
        source: musicSource,
        url: musicSource === 'local' ? '' : processURL(musicTitle, musicSource),
        fileId: localFile.fileId,
        startTime: parseInt(startTime),
        endTime: parseInt(endTime),
        title: musicDisplayTitle || getDisplayUrl()
      };
      
      // Call the parent component's preview function
      previewMusic(previewData);
    };
    
    // Handle file upload button click
    const handleFileButton = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileUpload(e.target.files[0], (fileInfo) => {
            setLocalFile(fileInfo);
            if (!musicDisplayTitle) {
              setMusicDisplayTitle(fileInfo.name);
            }
          });
        }
      };
      input.click();
    };
    
    const handleSave = () => {
      handleSavePlayer({
        name,
        number,
        walkupMusic: {
          source: musicSource,
          title: musicTitle,
          artist: musicDisplayTitle || getDisplayUrl(),
          fileId: localFile.fileId,
          startTime: parseInt(startTime),
          endTime: parseInt(endTime)
        }
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
        <div className="bg-white rounded-lg w-full max-w-md p-4">
          <h2 className="text-lg font-bold mb-4">{editingPlayer ? 'Edit Player' : 'Add New Player'}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Enter player name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Number</label>
              <input 
                type="text" 
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Enter jersey number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Music Source</label>
              <select 
                value={musicSource}
                onChange={(e) => setMusicSource(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="spotify">Spotify</option>
                <option value="youtube">YouTube</option>
                <option value="local">Local MP3 File</option>
              </select>
            </div>
            
            {musicSource === 'local' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={localFile.name || "No file selected"}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg p-2 bg-gray-50"
                  />
                  <button
                    onClick={handleFileButton}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {musicSource === 'spotify' ? 'Spotify URL' : 'YouTube URL'}
                </label>
                <input 
                  type="text" 
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder={`Paste ${musicSource === 'spotify' ? 'Spotify' : 'YouTube'} URL`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {musicSource === 'spotify' 
                    ? 'Example: https://open.spotify.com/track/...' 
                    : 'Example: https://www.youtube.com/watch?v=... or https://youtu.be/...'}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Title (optional)</label>
              <input 
                type="text" 
                value={musicDisplayTitle}
                onChange={(e) => setMusicDisplayTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Enter song title and artist for display"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (s)</label>
                <input 
                  type="number" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time (s)</label>
                <input 
                  type="number" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  min="0"
                />
              </div>
            </div>
            
            <button
              onClick={handlePreview}
              className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Preview Clip
            </button>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg"
              onClick={() => {
                setEditingPlayer(null);
                setShowAddPlayer(false);
              }}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={handleSave}
            >
              Save Player
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Preview Component
  const MusicPreviewComponent = () => {
    if (!previewData) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
        <div className="bg-white rounded-lg w-full max-w-md p-4">
          <h2 className="text-lg font-bold mb-4">Music Preview</h2>
          
          <div className="mb-4">
            <p className="font-medium text-center">{previewData.title}</p>
            <p className="text-sm text-gray-500 text-center">
              Start Point: {previewData.startTime}s
            </p>
          </div>
          
          {previewData.source === 'spotify' && (
            <iframe 
              src={`${previewData.url}?autoplay=1`}
              width="100%" 
              height="152" 
              frameBorder="0" 
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="mb-4"
            ></iframe>
          )}
          
          {previewData.source === 'youtube' && (
            <iframe 
              width="100%" 
              height="215" 
              src={`${previewData.url}?start=${previewData.startTime}&autoplay=1`}
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="mb-4"
            ></iframe>
          )}
          
          {previewData.source === 'local' && (
            <div className="flex items-center justify-center mb-4 p-4 bg-gray-100 rounded-lg">
              <Volume2 className="w-8 h-8 text-blue-600" />
              <span className="ml-2">Playing from local file</span>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Audio element for local file playback */}
      <audio ref={audioRef} className="hidden"></audio>
      
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Baseball Walk-up App</h1>
          <button onClick={() => setShowSettings(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Current Player Announcement */}
      {currentPlayer && (
        <div className="bg-blue-800 text-white p-4 text-center">
          <div className={`${isPlaying ? 'animate-pulse' : ''}`}>
            <p className="text-lg">Now batting. Number {currentPlayer.number}</p>
            <p className="text-2xl font-bold">{currentPlayer.name}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm">{currentPlayer.walkupMusic.title}</span>
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </div>
          </div>
          
          {/* Hidden YouTube player that autoplays */}
          {currentPlayer.walkupMusic.source === 'youtube' && (
            <div className="relative">
              <iframe 
                width="1" 
                height="1" 
                src={`${currentPlayer.walkupMusic.url}?start=${currentPlayer.walkupMusic.startTime}&autoplay=1&controls=0`}
                title="YouTube player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute opacity-0"
              ></iframe>
              <div className="flex items-center justify-center gap-2 mt-3 bg-blue-900 p-2 rounded-lg">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span>YouTube music playing</span>
              </div>
            </div>
          )}
          
          {/* Enhanced Spotify player with robust autoplay */}
          {currentPlayer.walkupMusic.source === 'spotify' && (
            <div className="mt-2 pt-2 border-t border-blue-700 spotify-container">
              <iframe 
                src={`${currentPlayer.walkupMusic.url}?autoplay=1`}
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="mx-auto spotify-iframe"
              ></iframe>
              
              {/* Hidden play button for autoplay assistance */}
              <button 
                className="hidden spotify-play-trigger"
                aria-hidden="true"
                onClick={() => {
                  const iframe = document.querySelector('.spotify-iframe');
                  if (iframe) {
                    // Force reload with fresh autoplay parameter
                    iframe.src = iframe.src.includes('?') ? 
                      `${iframe.src.split('?')[0]}?autoplay=1` : 
                      `${iframe.src}?autoplay=1`;
                  }
                }}
              >
                Autoplay
              </button>
            </div>
          )}
          
          {/* Local audio player */}
          {currentPlayer.walkupMusic.source === 'local' && (
            <div className="flex items-center justify-center mt-2 bg-blue-900 p-2 rounded-lg">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="ml-2">Local audio playing</span>
            </div>
          )}
          
          {/* Stop button */}
          <button 
            className="mt-4 bg-red-700 text-white px-4 py-2 rounded-lg mx-auto block"
            onClick={stopPlayback}
          >
            Stop Music
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
        {/* Navigation Tabs */}
        <div className="flex border-b bg-white">
          <button 
            className={`flex-1 py-3 font-medium ${activeTab === 'lineup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('lineup')}
          >
            Game Lineup
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${activeTab === 'players' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('players')}
          >
            Player Roster
          </button>
        </div>

        {/* Game Lineup Tab */}
        {activeTab === 'lineup' && (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Today's Lineup</h2>
            
            {/* Available Players */}
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Available Players</h3>
              <div className="flex flex-wrap gap-2">
                {availablePlayers.length === 0 ? (
                  <p className="text-gray-500 text-sm p-2">All players are in the lineup</p>
                ) : (
                  availablePlayers.map(player => (
                    <div 
                      key={player.id}
                      className="bg-white rounded-lg p-2 shadow-sm flex items-center gap-2 cursor-pointer border border-transparent hover:border-blue-300"
                      onClick={() => addToLineup(player)}
                      draggable
                      onDragStart={() => handleDragStart(player)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                        {player.number}
                      </div>
                      <span className="font-medium">{player.name}</span>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* The Lineup */}
            <div>
              <h3 className="text-md font-medium mb-2">Batting Order</h3>
              {gameLineup.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <p className="text-gray-500 mb-4">No players in the lineup yet</p>
                  <p className="text-sm text-gray-500">Add players from above or visit the Player Roster tab to create new players</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {gameLineup.map((player, index) => (
                    <li
                      key={player.id}
                      className={`bg-white rounded-lg p-3 shadow-sm ${
                        dragOverIndex === index ? 'border-2 border-blue-400' : ''
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(player)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-500">#{player.number} • {player.walkupMusic.title}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="text-green-600 p-1"
                            onClick={() => announcePlayer(player)}
                          >
                            <Play className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-red-600 p-1"
                            onClick={() => stopPlayerMusic(player)}
                          >
                            <StopCircle className="w-5 h-5" />
                          </button>
                          <div className="relative">
                            <button 
                              className="text-gray-600 p-1"
                              onClick={() => toggleDropdownMenu(player.id)}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {dropdownMenuOpen === player.id && (
                              <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-lg py-1 z-10 w-40">
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                  onClick={() => removeFromLineup(player.id)}
                                >
                                  <Trash2 className="w-4 h-4" /> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Player Roster</h2>
              <button 
                className="bg-blue-600 text-white p-2 rounded-full"
                onClick={() => {
                  setEditingPlayer(null);
                  setShowAddPlayer(true);
                }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search players..." 
                className="bg-white rounded-lg pl-10 pr-4 py-2 w-full shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {filteredPlayers.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <p className="text-gray-500">No players found</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredPlayers.map(player => (
                  <li key={player.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          <span className="text-sm text-gray-500">#{player.number}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          {player.walkupMusic.source === 'spotify' && <Music className="w-4 h-4 mr-1 text-green-500" />}
                          {player.walkupMusic.source === 'youtube' && <Music className="w-4 h-4 mr-1 text-red-500" />}
                          {player.walkupMusic.source === 'local' && <Music className="w-4 h-4 mr-1 text-blue-500" />}
                          {player.walkupMusic.title} • {player.walkupMusic.startTime}s
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className="bg-green-100 text-green-600 p-2 rounded-lg"
                          onClick={() => previewMusic({
                            source: player.walkupMusic.source,
                            url: player.walkupMusic.url,
                            fileId: player.walkupMusic.fileId,
                            startTime: player.walkupMusic.startTime,
                            endTime: player.walkupMusic.endTime,
                            title: player.walkupMusic.title
                          })}
                        >
                          <Play className="w-5 h-5" />
                        </button>
                        <button 
                          className="bg-blue-100 text-blue-600 p-2 rounded-lg"
                          onClick={() => addToLineup(player)}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button 
                          className="bg-gray-100 text-gray-600 p-2 rounded-lg"
                          onClick={() => {
                            setEditingPlayer(player);
                            setShowAddPlayer(true);
                          }}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      {/* Footer with Play Controls (when in lineup view) */}
      {activeTab === 'lineup' && gameLineup.length > 0 && (
        <footer className="bg-white border-t p-4">
          <button 
            className="bg-blue-600 text-white w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            onClick={() => gameLineup.length > 0 && announcePlayer(gameLineup[0])}
          >
            <Play className="w-5 h-5" /> Announce Next Batter
          </button>
        </footer>
      )}

      {/* Add/Edit Player Modal */}
      {showAddPlayer && <PlayerEditor />}
      
      {/* Music Preview Modal */}
      {showPreview && <MusicPreviewComponent />}
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <h2 className="text-lg font-bold mb-4">App Settings</h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Spotify Integration</h3>
                <p className="text-sm text-gray-500">
                  You're using simplified Spotify embedding. No login required.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">YouTube Integration</h3>
                <p className="text-sm text-gray-500">
                  You're using simplified YouTube embedding. No login required.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h3 className="font-medium mb-2">Local Music Files</h3>
                <p className="text-sm text-gray-700">
                  Upload MP3 files directly to use as walk-up music.
                </p>
                <p className="text-sm text-yellow-700 mt-1 font-medium">
                  Important: Local files need to be re-uploaded after page refresh.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: For music that persists between sessions, use Spotify or YouTube links instead.
                </p>
              </div>
              
              <div className="mt-4">
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg w-full"
                  onClick={() => {
                    localStorage.setItem('walkupPlayers', JSON.stringify(players));
                    localStorage.setItem('walkupLineup', JSON.stringify(gameLineup));
                    alert('Data saved successfully!');
                  }}
                >
                  Save All Data Manually
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
            