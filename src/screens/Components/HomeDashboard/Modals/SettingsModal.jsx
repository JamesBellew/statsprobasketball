import React, { useRef, useEffect, useState } from "react";
import jerseyPlaceholder from "../../../../assets/logo.jpg";
import { db } from "../../../../db";
// Add these imports at the top of your file
import { 
  doc as firestoreDoc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc 
} from "firebase/firestore";
// import { doc as firestoreDoc, getDoc, setDoc } from "firebase/firestore";

import { firestore } from "../../../../firebase";
import useAuth from "../../../../hooks/useAuth";

const SettingsModal = ({ onClose ,setAlertMessage}) => {
  const { user } = useAuth();
  const modalRef = useRef();
  const [teamNameTouched, setTeamNameTouched] = useState(false);

  const [teamImage, setTeamImage] = useState(jerseyPlaceholder);
  const [quarterLength, setQuarterLength] = useState(10);
  const [teamColor, setTeamColor] = useState("");
  const [theme, setTheme] = useState("");
  const [teamName, setTeamName] = useState("");
  const [savedSettings, setSavedSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const isTeamNameValid = teamName.trim().length >= 3;

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (user) {
            const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
            const snap = await getDoc(ref);
            
            if (snap.exists()) {
                const settings = snap.data(); // ✅ FIXED
              
                setTeamName(settings.teamName || "");
                setQuarterLength(settings.quarterLength || 10);
                setTeamColor(settings.teamColor || "");
                setTheme(settings.theme || "");
                setTeamImage(settings.teamImage || jerseyPlaceholder);
                setSavedSettings(settings);
              }
              
        }  else {
            try {
              const localSettings = await db.settings.get("preferences");
          
              if (localSettings) {
                setTeamName(localSettings.teamName || "");
                setQuarterLength(localSettings.quarterLength || 10);
                setTeamColor(localSettings.teamColor || "");
                setTheme(localSettings.theme || "");
                setTeamImage(localSettings.teamImage || jerseyPlaceholder);
                setSavedSettings(localSettings);
              }
            } catch (err) {
              console.error("Dexie load error:", err);
            }
          }
          
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
  
    loadSettings();
  }, [user]);
  

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTeamImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setTeamImage(jerseyPlaceholder);
//   const handleSaveSettings = async () => {
//     const settingsData = {
//       teamName,
//       teamImage,
//       quarterLength,
//       teamColor,
//       theme,
//     };
  
//     try {
//       setSaving(true);
  
//       if (user) {
//         const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
//         await setDoc(ref, settingsData);
//       } else {
//         await db.settings.put({ id: "preferences", ...settingsData });
//       }
      
  
//       setSavedSettings(settingsData);
//       setTimeout(() => {
//         setSaving(false);
//         onClose();
//       }, 1000);

  
// setTimeout(() => {
//   setSaving(false);
//   onClose();
// }, 1000);
// setSavedSettings(settingsData);
// setAlertMessage("✅ Settings updated!");
// setTimeout(() => {
//     setAlertMessage(""); // clear after showing
//   }, 3000);
//     } catch (error) {
//       console.error("Error saving settings:", error);
//       setSaving(false);
//     }

//     if (setTeamImage) {
//       setTeamImage(teamImage); // ✅ Push to HomeDashboard
//     }
    
//   };
  
  // Updated handleSaveSettings function
const handleSaveSettings = async () => {
  if (!isTeamNameValid) {
    setAlertMessage("❌ Please enter a valid team name (minimum 3 characters)");
    setTimeout(() => setAlertMessage(""), 3000);
    return;
  }

  const settingsData = {
    teamName,
    teamImage,
    quarterLength,
    teamColor,
    theme,
  };

  try {
    setSaving(true);

    // Check if team name already exists in the Teams collection
    const teamsRef = collection(firestore, "Teams");
    const teamQuery = query(teamsRef, where("Name", "==", teamName.trim()));
    const teamSnapshot = await getDocs(teamQuery);

    if (!teamSnapshot.empty) {
      // Team name already exists
      setAlertMessage("❌ Team name already exists. Please choose a different name.");
      setTimeout(() => setAlertMessage(""), 3000);
      setSaving(false);
      return;
    }

    // Team name doesn't exist, proceed with saving
    if (user) {
      // Save user settings to Firestore
      const userSettingsRef = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
      await setDoc(userSettingsRef, settingsData);

      // Add team to Teams collection
      await addDoc(teamsRef, {
        Name: teamName.trim(),
        Color: teamColor,
        Image: teamImage,
        CreatedBy: user.uid,
        CreatedAt: new Date().toISOString(),
        // Add any other team-related fields you want to store
      });
    } else {
      // Save to local Dexie database
      await db.settings.put({ id: "preferences", ...settingsData });
      
      // For non-authenticated users, you might want to handle this differently
      // since they can't save to Firestore Teams collection
      // You could store it locally or prompt them to sign in
    }

    setSavedSettings(settingsData);
    setAlertMessage("✅ Settings and team created successfully!");
    
    setTimeout(() => {
      setSaving(false);
      onClose();
      setAlertMessage(""); // Clear after closing
    }, 2000);

  } catch (error) {
    console.error("Error saving settings:", error);
    setAlertMessage("❌ Error saving settings. Please try again.");
    setTimeout(() => setAlertMessage(""), 3000);
    setSaving(false);
  }

  // Update team image if needed
  if (setTeamImage) {
    setTeamImage(teamImage);
  }
};

  // 🧠 Validation: Only enable save if there's a change
  const hasChanges = () => {
    if (!savedSettings) return true; // Allow save if nothing loaded yet
    return (
      teamName !== savedSettings.teamName ||
      teamImage !== savedSettings.teamImage ||
      quarterLength !== savedSettings.quarterLength ||
      teamColor !== savedSettings.teamColor ||
      theme !== savedSettings.theme
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-primary-bg text-white p-8 rounded-lg w-full mx-10 max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-8">Settings</h2>

        {/* Image Upload */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-card-bg overflow-hidden">
            <img src={teamImage} alt="Team" className="w-full h-full object-cover" />
          </div>
          <div className="space-x-3">
            <label htmlFor="teamLogo" className="bg-primary-cta px-4 py-2 rounded cursor-pointer">Upload</label>
            <input type="file" id="teamLogo" className="hidden" onChange={handleImageUpload} />
            <button onClick={removeImage} className="bg-white/10 px-4 py-2 rounded text-sm hover:bg-white/20">Remove</button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="mb-1">
  <label className="block text-sm font-medium mb-1">Team Name</label>
  <div className="relative">
    <input
      value={teamName}
      onChange={(e) => setTeamName(e.target.value)}
      onBlur={() => setTeamNameTouched(true)}
      type="text"
      className={`
        w-full px-4 py-2 bg-card-bg rounded border focus:outline-none focus:ring-2
        ${!isTeamNameValid && teamNameTouched ? 'border-red-500 focus:ring-red-500' : ''}
        ${isTeamNameValid && teamNameTouched ? 'border-green-500 focus:ring-green-500' : 'border-white/10'}
      `}
      placeholder="e.g. Ravens"
    />

    {isTeamNameValid && teamNameTouched && (
      <svg
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
  {!isTeamNameValid && teamNameTouched && (
    <p className="text-red-400 text-sm mt-1">Minimum of 3 characters.</p>
  )}
</div>


          <div>
            <label className="block text-sm font-medium mb-1">Quarter Length (Minutes)</label>
            <div className="relative flex items-center max-w-[8rem] border rounded-md border-primary-bg">
              <button onClick={() => setQuarterLength((prev) => Math.max(1, prev - 1))} className="bg-card-bg border border-white/10 rounded-s-lg p-3 h-11">
                <svg className="w-3 h-3 text-white" viewBox="0 0 18 2" fill="none">
                  <path d="M1 1h16" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <input type="text" readOnly value={quarterLength} className="bg-card-bg border-x-0 text-center text-white w-full h-11 text-sm" />
              <button onClick={() => setQuarterLength((prev) => prev + 1)} className="bg-card-bg border border-white/10 rounded-e-lg p-3 h-11">
                <svg className="w-3 h-3 text-white" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1v16M1 9h16" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Home Team Color</label>
            <div className="flex space-x-2 mb-2">
              {[
                "#8B5CF6", // purple
                "#06B6D4", // cyan/teal
                "#F59E0B", // amber/orange
                "#EF4444", // red
                "#10B981", // emerald green
                "#6366F1", // indigo
                "#EC4899", // hot pink
                "#64748B"  // slate gray
              ].map((color, idx) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${teamColor === color ? 'border-white scale-110' : 'border-gray-400'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setTeamColor(color)}
                  aria-label={`Select color ${color}`}
                >
                  {teamColor === color && (
                    <svg className="w-4 h-4 mx-auto my-auto text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">App Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-2 bg-card-bg text-white rounded border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-cta"
            >
              <option value="">Select one</option>
              <option value="dark">Dark (Default)</option>
              {/* <option value="light">Light</option>
              <option value="system">System</option> */}
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
        <button
  onClick={handleSaveSettings}
  disabled={!hasChanges() || saving}
  className={`px-6 py-2 rounded shadow flex items-center justify-center gap-2 ${
    hasChanges() && !saving
      ? "bg-primary-cta hover:bg-blue-500 text-white"
      : "bg-gray-600 text-gray-400 cursor-not-allowed"
  }`}
>
  {saving ? (
    <>
      <svg
        className="animate-spin h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</button>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
