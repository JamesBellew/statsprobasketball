import React, { useRef, useEffect, useState } from "react";
import jerseyPlaceholder from "../../../../assets/logo.jpg";
import { db } from "../../../../db";

import { 
  doc as firestoreDoc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc
} from "firebase/firestore";

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

  // 🔹 Groups state (formerly dummy "teams")
  const [groups, setGroups] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");

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

  // Load saved settings + groups
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (user) {
          const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
          const snap = await getDoc(ref);
          
          if (snap.exists()) {
            const settings = snap.data();
            setTeamName(settings.teamName || "");
            setQuarterLength(settings.quarterLength || 10);
            setTeamColor(settings.teamColor || "");
            setTheme(settings.theme || "");
            setTeamImage(settings.teamImage || jerseyPlaceholder);
            setSavedSettings(settings);
          }

          // 🔹 Fetch groups for this team (lookup by teamName)
          if (teamName) {
            const teamsRef = collection(firestore, "Teams");
            const teamQuery = query(teamsRef, where("Name", "==", teamName));
            const snapshot = await getDocs(teamQuery);
            if (!snapshot.empty) {
              const teamDoc = snapshot.docs[0];
              setGroups(teamDoc.data().groups || []);
            }
          }

        } else {
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
  }, [user, teamName]);

  // 🔹 Save updated groups back to Firestore
  const saveGroups = async (updatedGroups) => {
    try {
      const teamsRef = collection(firestore, "Teams");
      const teamQuery = query(teamsRef, where("Name", "==", teamName));
      const snapshot = await getDocs(teamQuery);

      if (!snapshot.empty) {
        const teamDoc = snapshot.docs[0];
        await updateDoc(teamDoc.ref, { groups: updatedGroups });
        setGroups(updatedGroups);
      }
    } catch (err) {
      console.error("Error updating groups:", err);
    }
  };

  // 🔹 Handlers for groups
  const handleAddGroup = async () => {
    if (!newGroup.trim()) return;
    const updated = [...groups, newGroup.trim()];
    await saveGroups(updated);
    setNewGroup("");
    setShowAddInput(false);
  };

  const handleDeleteGroup = async (index) => {
    const updated = groups.filter((_, i) => i !== index);
    await saveGroups(updated);
  };

  const handleSaveEdit = async (index) => {
    if (!editingName.trim()) return;
    const updated = [...groups];
    updated[index] = editingName.trim();
    await saveGroups(updated);
    setEditingIndex(null);
    setEditingName("");
  };

  // 🖼️ Upload/remove image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTeamImage(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => setTeamImage(jerseyPlaceholder);

  // Save team + settings
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

      const teamsRef = collection(firestore, "Teams");
      const teamQuery = query(teamsRef, where("Name", "==", teamName.trim()));
      const teamSnapshot = await getDocs(teamQuery);

      if (user) {
        const userSettingsRef = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
        await setDoc(userSettingsRef, settingsData);

        if (teamSnapshot.empty) {
          // Add new team doc if it doesn't exist
          await addDoc(teamsRef, {
            Name: teamName.trim(),
            Color: teamColor,
            Image: teamImage,
            groups,
            CreatedBy: user.uid,
            CreatedAt: new Date().toISOString(),
          });
        }
      } else {
        await db.settings.put({ id: "preferences", ...settingsData });
      }

      setSavedSettings(settingsData);
      setAlertMessage("✅ Settings saved!");
      setTimeout(() => {
        setSaving(false);
        onClose();
        setAlertMessage("");
      }, 2000);

    } catch (error) {
      console.error("Error saving settings:", error);
      setAlertMessage("❌ Error saving settings. Please try again.");
      setTimeout(() => setAlertMessage(""), 3000);
      setSaving(false);
    }
  };

  // Validation: Only enable save if there's a change
  const hasChanges = () => {
    if (!savedSettings) return true;
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
            <button onClick={removeImage} className="bg-card-bg px-4 py-2 rounded text-sm hover:bg-white/20">Remove</button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Team Name */}
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
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {!isTeamNameValid && teamNameTouched && (
              <p className="text-red-400 text-sm mt-1">Minimum of 3 characters.</p>
            )}
          </div>

          <div></div>

          {/* 🔹 Groups Section */}
          <div className="w-full col-span-2 p-2 rounded-lg">
            <div className="flex items-center justify-start space-x-2 mb-4">
              <label className="text-sm font-medium text-white">Age Groups</label>
              <button
                onClick={() => setShowAddInput(!showAddInput)}
                className="px-3 py-1.5 bg-primary-cta flex justify-center items-center text-white text-sm font-medium rounded-md shadow hover:bg-primary-cta/50 transition"
              >
                +
              </button>
            </div>

            {showAddInput && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  type="text"
                  placeholder="Enter new age group"
                  className="flex-1 px-3 py-2 bg-card-bg rounded border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-cta"
                />
                <button onClick={handleAddGroup} className="px-3 py-2 bg-primary-cta rounded text-sm font-medium hover:bg-primary-cta/50">Add</button>
                <button onClick={() => { setShowAddInput(false); setNewGroup(""); }} className="px-3 py-2 bg-gray-600 rounded text-sm font-medium hover:bg-gray-500">Cancel</button>
              </div>
            )}

            <div className="grid max-h-44 overflow-y-auto grid-cols-1 sm:grid-cols-2 gap-2">
              {groups.map((group, i) => (
                <div key={i} className="flex justify-between items-center rounded-lg bg-card-bg px-3 py-2 hover:bg-white/10 transition">
                  {editingIndex === i ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveEdit(i)}
                      autoFocus
                      className="flex-1 bg-transparent border-b border-white/20 text-sm text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-200">{group}</span>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => editingIndex === i ? handleSaveEdit(i) : (setEditingIndex(i), setEditingName(group))} className="p-1.5 rounded-md hover:bg-white/10 transition">✏️</button>
                    <button onClick={() => handleDeleteGroup(i)} className="p-1.5 rounded-md hover:bg-red-500/20 transition">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colors + Theme */}
          <div>
            <label className="block text-sm font-medium mb-1">Home Team Color</label>
            <div className="flex space-x-2 mb-2">
              {["#8B5CF6","#06B6D4","#F59E0B","#EF4444","#10B981","#6366F1","#EC4899","#64748B"].map((color) => (
                <button key={color} type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${teamColor === color ? 'border-white scale-110' : 'border-gray-400'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setTeamColor(color)}
                >
                  {teamColor === color && <svg className="w-4 h-4 mx-auto my-auto text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">App Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full px-4 py-2 bg-card-bg text-white rounded border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-cta">
              <option value="">Select one</option>
              <option value="dark">Dark (Default)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={!hasChanges() || saving}
            className={`px-6 py-2 rounded shadow flex items-center justify-center gap-2 ${hasChanges() && !saving ? "bg-primary-cta hover:bg-blue-500 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"}`}
          >
            {saving ? <>⏳ Saving...</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
