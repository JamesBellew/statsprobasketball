import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../db";
import useAuth from "../hooks/useAuth";
import { collection, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { firestore as firestoreDb } from "../firebase";

export default function StartGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedLineoutFromNav = location.state?.lineout;
  const passedTeamName = location.state?.teamName || "Home";

  const [opponentName, setOpponentName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("home");
  const [lineouts, setLineouts] = useState([]);
  const [selectedLineout, setSelectedLineout] = useState(selectedLineoutFromNav?.id || null);
  const [playerStatsEnabled, setPlayerStatsEnabled] = useState(false);
  const [broadcastToggle, setBroadcastToggle] = useState(false);
  const [minutesTracked, setMinutesTracked] = useState(false);
  const [opponentLogo, setOpponentLogo] = useState(null);
  const [awayTeamColor, setAwayTeamColor] = useState("#0b63fb");
  const [teamColor, setTeamColor] = useState("#8B5CF6");

  const [leagues, setLeagues] = useState([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [customLeague, setCustomLeague] = useState("");
  const [selectedLeagueName, setSelectedLeagueName] = useState("");
  const [customLeagueMode, setCustomLeagueMode] = useState(false);

  const [createCustomOpponent, setCreateCustomOpponent] = useState("no");
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedOpponentId, setSelectedOpponentId] = useState("");
  const [selectedOpponentName, setSelectedOpponentName] = useState("");
  const [customOpponent, setCustomOpponent] = useState("");
  const [customOpponentMode, setCustomOpponentMode] = useState(false);

  // Past result (no stats) mode
const [pastResultMode, setPastResultMode] = useState(false);
const [homeScoreInput, setHomeScoreInput] = useState("");
const [awayScoreInput, setAwayScoreInput] = useState("");

  // Groups (from the user's team)
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [userTeamName, setUserTeamName] = useState("");

  // PREVIEW: local toggle
  const [showPreview, setShowPreview] = useState(false);

  // ---------- NEW: Pre-game Card toggle + data ----------
  const [showPreGameCard, setShowPreGameCard] = useState(false);

  const [preGame, setPreGame] = useState({
    home: {
      ppg: "", papg: "", diff: "",
      record: { wins: "", losses: "" },
      form: ["", "", "", "", ""],      // 5 items: "W" | "L" | ""
      h2hWins: ""                       // home team wins vs opponent
    },
    away: {
      ppg: "", papg: "", diff: "",
      record: { wins: "", losses: "" },
      form: ["", "", "", "", ""],
      h2hWins: ""                       // away team wins vs opponent
    },
    totalGames: ""                      // optional total H2H games
  });

  // Small deep-set helper
  const setPre = (path, value) =>
    setPreGame(prev => {
      // robust deep clone (avoids structuredClone availability issues)
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return next;
    });

  const isOpponentValid =
    (selectedOpponentId && selectedOpponentName) || customOpponent.trim() !== "";

  const handleGoBack = (e) => {
    e.preventDefault();
    navigate("/startgame");
  };

  // Helpers for preview avatar
  const getInitials = (str) =>
    (str || "?")
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const TeamBadge = ({ name, logo, color }) => (
    <div
      className="w-10 h-10 rounded-full p-0.5 shrink-0"
      style={{ backgroundColor: color || "#6b7280" }}
    >
      {logo ? (
        <img
          src={logo}
          className="w-full h-full rounded-full bg-white p-0.5"
          alt={`${name || "team"} logo`}
        />
      ) : (
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-700 font-semibold">
          {getInitials(name)}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    async function fetchUserTeamName() {
      if (user) {
        try {
          const ref = doc(firestore, "users", user.uid, "settings", "preferences");
          const snap = await getDoc(ref);
          if (snap.exists() && snap.data().teamName) {
            const teamName = snap.data().teamName;
            setUserTeamName(teamName);
            await fetchUserTeamGroups(teamName);
          }
        } catch (error) {
          console.error("Error fetching user team name:", error);
        }
      } else {
        try {
          const localSettings = await db.settings.get("preferences");
          if (localSettings && localSettings.teamName) {
            setUserTeamName(localSettings.teamName);
            await fetchUserTeamGroups(localSettings.teamName);
          }
        } catch (error) {
          console.error("Error fetching local team name:", error);
        }
      }
    }
    fetchUserTeamName();
  }, [user]);

  const fetchUserTeamGroups = async (teamName) => {
    try {
      const qTeams = query(collection(firestore, "Teams"), where("Name", "==", teamName));
      const snapshot = await getDocs(qTeams);
      if (!snapshot.empty) {
        const userTeamData = snapshot.docs[0].data();
        setGroups(userTeamData.groups || []);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching user team groups:", error);
      setGroups([]);
    }
  };

  useEffect(() => {
    async function fetchTeams() {
      const snapshot = await getDocs(collection(firestore, "Teams"));
      const teamList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().Name || "Unnamed Team",
        groups: doc.data().groups || [],
      }));
      setTeams(teamList);
    }
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchLineouts = async () => {
      let allLineouts = [];
      const local = await db.lineouts.toArray();
      allLineouts = [...local];
      if (user) {
        const snapshot = await getDocs(collection(firestore, "users", user.uid, "lineouts"));
        const cloudLineouts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isCloud: true,
        }));
        allLineouts = [...local, ...cloudLineouts];
      }
      setLineouts(allLineouts);
    };
    fetchLineouts();
  }, [user]);

  const venueSelectedHandler = (venue) => setSelectedVenue(venue);

  useEffect(() => {
    if (playerStatsEnabled) {
      if (lineouts.length === 0) {
        alert("You don't have any saved lineout");
        setPlayerStatsEnabled(false);
        setSelectedLineout(null);
      } else {
        setSelectedLineout(lineouts[lineouts.length - 1].id);
      }
    }
  }, [playerStatsEnabled, lineouts]);

  const handleOpponentInputChange = (event) => setOpponentName(event.target.value);

  useEffect(() => {
    async function fetchLeagues() {
      const snapshot = await getDocs(collection(firestore, "Leagues"));
      const leagueList = [];
      snapshot.docs.forEach((doc) => {
        const region = doc.id;
        const names = doc.data().Names || [];
        names.forEach((name) => {
          leagueList.push({ id: region, name });
        });
      });
      setLeagues(leagueList);
    }
    fetchLeagues();
  }, []);

  const handleLeagueChange = (e) => {
    const [id, name] = e.target.value.split("|");
    setSelectedLeagueId(id);
    setSelectedLeagueName(name);
    setCustomLeague("");
  };

  const handleCustomLeagueChange = (e) => {
    setCustomLeague(e.target.value);
    setSelectedLeagueId("");
    setSelectedLeagueName("");
  };

  const handleGameStart = async () => {
    let opponentNameFinal = selectedOpponentName;
    if (customOpponent.trim()) opponentNameFinal = customOpponent.trim();
  
    if (!opponentNameFinal) {
      alert("Please select or enter an opponent.");
      return;
    }
  
    if (!selectedLeagueId && !customLeague.trim()) {
      alert("Please select a league or enter a custom league.");
      return;
    }
  
    if (customOpponent.trim() && createCustomOpponent === "yes") {
      try {
        const newTeamRef = doc(collection(firestore, "Teams"));
        await setDoc(newTeamRef, {
          Name: customOpponent.trim(),
          Color: "#6366F1",
          CreatedAt: new Date().toISOString(),
          CreatedBy: user?.uid || "system",
          Image: opponentLogo || "",
        });
      } catch (err) {
        console.error("Error creating opponent team:", err);
      }
    }
  
    const selectedLineoutData =
      playerStatsEnabled && selectedLineout
        ? lineouts.find((l) => l.id.toString() === selectedLineout.toString()) || null
        : null;
  
    const dateStr = new Date().toISOString().split("T")[0];
    const slug = `${passedTeamName}-vs-${opponentNameFinal}-${dateStr}`
      .toLowerCase()
      .replace(/\s+/g, "-");
  
    let leagueId = selectedLeagueId;
    let leagueName = selectedLeagueName;
    if (customLeague.trim()) {
      leagueId = "custom";
      leagueName = customLeague.trim();
    }
  
  // ---------- PAST RESULT MODE ----------
if (pastResultMode) {
  const hs = Number(homeScoreInput);
  const as = Number(awayScoreInput);
  if (!Number.isFinite(hs) || hs < 0 || !Number.isFinite(as) || as < 0) {
    alert("Please enter valid non-negative scores for both teams.");
    return;
  }

  // who is 'home' in the saved doc
  const homeNameFinal = selectedVenue === "home" ? passedTeamName : opponentNameFinal;
  const awayNameFinal = selectedVenue === "home" ? opponentNameFinal : passedTeamName;

  const homeColorFinal = selectedVenue === "home" ? (teamColor || "#8B5CF6") : awayTeamColor;
  const awayColorFinal = selectedVenue === "home" ? awayTeamColor : (teamColor || "#8B5CF6");
  const homeLogoFinal  = selectedVenue === "home" ? null : opponentLogo;
  const awayLogoFinal  = selectedVenue === "home" ? opponentLogo : null;

  const docData = {
    id: slug,
    slug,
    link: `/liveGames/${slug}`,
    createdAt: Date.now(),
    scheduledStart: { date: dateStr },
    homeTeamName: homeNameFinal,
    teamNames: { home: homeNameFinal, away: awayNameFinal },
    opponentName: awayNameFinal,
    logos: { home: homeLogoFinal || "", away: awayLogoFinal || "" },
    homeTeamColor: homeColorFinal,
    awayTeamColor: awayColorFinal,
    opponentGroup: selectedGroup || "",
    venue: selectedVenue,
    league: { id: leagueId, name: leagueName },
    passedScore: { home: hs, away: as },
    gameState: true,        // finished
    gameActions: [],
    quarter: 4,
    isLive: false,
    broadcast: false,
    preGameCardEnabled: false,
  };

  try {
    await setDoc(doc(firestore, "liveGames", slug), docData);

    // define gameState BEFORE navigate so it doesn't throw
    const gameState = {
      opponentName: opponentNameFinal,
      selectedVenue,
      playerStatsEnabled: false,
      lineout: null,
      opponentLogo,
      minutesTracked: false,
      passedTeamName,
      broadcast: false,
      preGameCardEnabled: false,
      preGameCard: null,
      slug,
      awayTeamColor,
      pastHomeScore: hs,   // 👈 add this
      pastAwayScore: as,   // 👈 add this
      leagueId,
      leagueName,
      opponentGroup: selectedGroup,
      finished: true,
    };

    navigate("/ingame", { state: gameState });
  } catch (err) {
    console.error("Error saving past result or navigating:", err);
    alert("Could not save past result. Please try again.");
  }
  return;
}

  
    // ---------- NORMAL FLOW (your existing behavior) ----------
    // If broadcasting, create the live game shell now
    if (broadcastToggle) {
      await setDoc(doc(firestoreDb, "liveGames", slug), {
        homeTeamName: passedTeamName,
        teamNames: { home: passedTeamName, away: opponentNameFinal },
        opponentName: opponentNameFinal,
        createdAt: Date.now(),
        isLive: true,
        slug,
        link: `/liveGames/${slug}`,
        awayTeamColor,
        homeTeamColor: teamColor || "#8B5CF6",
        league: { id: leagueId, name: leagueName },
        venue: selectedVenue,
        opponentGroup: selectedGroup || "",
        scheduledStart: { date: dateStr },
        passedScore: { home: 0, away: 0 },
        gameState: false,
        gameActions: [],
        preGameCardEnabled: showPreGameCard,
        preGameCard: showPreGameCard ? preGame : null,
        logos: { home: "", away: opponentLogo || "" },
      });
    }
  
    // continue to in-game screen with your existing state
    const gameState = {
      opponentName: opponentNameFinal,
      selectedVenue,
      playerStatsEnabled,
      lineout: selectedLineoutData,
      opponentLogo,
      minutesTracked,
      passedTeamName,
      broadcast: broadcastToggle,
      preGameCardEnabled: showPreGameCard,
      preGameCard: showPreGameCard ? preGame : null,
      slug,
      awayTeamColor,
      leagueId,
      leagueName,
      opponentGroup: selectedGroup,
    };
  
    navigate("/ingame", { state: gameState });
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOpponentLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOpponentLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function fetchTeamColor() {
      if (user) {
        const ref = doc(firestore, "users", user.uid, "settings", "preferences");
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().teamColor) setTeamColor(snap.data().teamColor);
      } else {
        const localSettings = await db.settings.get("preferences");
        if (localSettings && localSettings.teamColor) setTeamColor(localSettings.teamColor);
      }
    }
    fetchTeamColor();
  }, [user]);

  // ---------- Derived values for PREVIEW ----------
  const leagueDisplay = customLeague.trim() || selectedLeagueName || "";
  const groupLabel = selectedGroup || "";
  const opponentResolved =
    (customOpponentMode && customOpponent.trim()) || selectedOpponentName || "";
  const isHome = selectedVenue === "home";

  const homeName = isHome ? passedTeamName : opponentResolved || "Home Team";
  const awayName = isHome ? opponentResolved || "Opponent" : passedTeamName;

  const homeLogo = isHome ? null : opponentLogo; // opponent logo when they are home
  const awayLogo = isHome ? opponentLogo : null;

  const homeColor = isHome ? teamColor : awayTeamColor;
  const awayColor = isHome ? awayTeamColor : teamColor;

  // ---------- Small WL chip + Recent Form row ----------
  // This is where I will determine the Win and loss form of the team being printed 
  const WLChip = ({ value, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`h-7 w-7 text-[11px] font-semibold rounded-md border transition
        ${value === "W"
          ? "bg-green-500/15 text-green-400 border-green-500/30"
          : value === "L"
          ? "bg-red-500/15 text-red-400 border-red-500/30"
          : "bg-white/5 text-gray-300 border-white/10"}`}
      title="Toggle W/L"
    >
      {value || "·"}
    </button>
  );

  const FormRow = ({ teamKey }) => (
    <div className="flex items-center gap-2">
      {[0,1,2,3,4].map(i => (
        <WLChip
          key={i}
          value={preGame[teamKey].form[i]}
          onToggle={() => {
            const next = [...preGame[teamKey].form];
            next[i] = next[i] === "W" ? "L" : next[i] === "L" ? "" : "W";
            setPre(`${teamKey}.form`, next);
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-gray-900 flex items-center justify-center py-8 px-2">
      <div className="relative w-full max-w-xl mx-auto bg-gray-900/90 rounded-2xl shadow-lg p-8 flex flex-col gap-3 border border-gray-800">

        {/* Header buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/homedashboard")}
            className="flex items-center h-12 gap-2 w-fit rounded-lg bg-gray-800 hover:bg-gray-700 text-white shadow-md px-3 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="font-medium text-sm">Back</span>
          </button>

          {/* PREVIEW toggle */}
          <button
            onClick={() => setShowPreview((s) => !s)}
            className="flex items-center h-12 gap-2 w-fit rounded-lg bg-gray-800 hover:bg-gray-700 text-white shadow-md px-3 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
            </svg>
            <span className="font-medium text-sm">{showPreview ? "Hide Preview" : "Preview"}</span>
          </button>
          
        </div>
{/* ---------- Past Result (no stats) ---------- */}
<div className="bg-gray-800 rounded-lg flex items-center justify-between px-4 py-3 mt-1">
  <span className="text-sm text-gray-200 font-medium">Enter Past Result (no stats)</span>
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={pastResultMode}
      onChange={(e) => setPastResultMode(e.target.checked)}
      className="sr-only peer"
    />
    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all" />
  </label>
</div>

{/* Scores inputs when pastResultMode */}
<div className={`overflow-hidden transition-all duration-300 ease-out ${
  pastResultMode ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
}`}>
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-[11px] text-gray-400 mb-1">
        {selectedVenue === "home" ? (passedTeamName || "Home") : (selectedOpponentName || customOpponent || "Home")} Score
      </label>
      <input
        type="number"
        min="0"
        value={homeScoreInput}
        onChange={(e) => setHomeScoreInput(e.target.value)}
        className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
        placeholder="0"
      />
    </div>
    <div>
      <label className="block text-[11px] text-gray-400 mb-1">
        {selectedVenue === "away" ? (passedTeamName || "Away") : (selectedOpponentName || customOpponent || "Away")} Score
      </label>
      <input
        type="number"
        min="0"
        value={awayScoreInput}
        onChange={(e) => setAwayScoreInput(e.target.value)}
        className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
        placeholder="0"
      />
    </div>
  </div>
  <p className="text-xs text-amber-300 mt-2">
    This will save the game as <span className="font-semibold">Full Time</span> with no stats.
  </p>
</div>

        {/* PREVIEW CARD (hidden by default) */}
        {showPreview && (
          <div className="w-full flex">
            <div className="w-full mx-auto bg-gray-800/30 rounded-lg border border-zinc-800/60 overflow-hidden">
              {/* Header row: group (left) | league (right) */}
              <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-800/60 bg-gray-900/40">
                <div className="flex items-center gap-2">
                  {groupLabel && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-100 bg-white/5 px-2 py-[2px] rounded-full max-w-[180px] truncate">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7.5 9a7.5 7.5 0 0115 0H4.5z" />
                      </svg>
                      <span className="truncate">{groupLabel}</span>
                    </span>
                  )}
                </div>
                <span className="text-zinc-400 text-xs font-medium truncate max-w-[60%]">
                  {leagueDisplay || "League"}
                </span>
              </div>

              {/* Teams */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  {/* Away */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <TeamBadge name={awayName} logo={awayLogo} color={awayColor} />
                    <div className="min-w-0">
                      <div className="text-white text-base font-semibold truncate max-w-[140px]">{awayName || "Away Team"}</div>
                      <div className="text-zinc-400 text-xs">Away</div>
                    </div>
                  </div>

                  <div className="px-6 text-center">
                    <div className="text-zinc-400 text-sm">VS</div>
                  </div>

                  {/* Home */}
                  <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                    <div className="min-w-0 text-right">
                      <div className="text-white text-base font-semibold truncate max-w-[140px]">{homeName || "Home Team"}</div>
                      <div className="text-zinc-400 text-xs">Home</div>
                    </div>
                    <TeamBadge name={homeName} logo={homeLogo} color={homeColor} />
                  </div>
                </div>
              </div>

              {/* Accent line */}
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(to right, ${awayColor || "#0b63fb"} 0%, ${awayColor || "#0b63fb"} 50%, ${homeColor || "#8B5CF6"} 50%, ${homeColor || "#8B5CF6"} 100%)`,
                }}
              />
            </div>
          </div>
        )}

        {/* ------------ FORM FIELDS ------------ */}
        <div className="flex flex-col gap-4">
          {/* League */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-300">League</label>
            <div>
              {!customLeagueMode ? (
                <>
                  <select
                    value={selectedLeagueId && selectedLeagueName ? `${selectedLeagueId}|${selectedLeagueName}` : ""}
                    onChange={handleLeagueChange}
                    className="block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 text-sm
                      focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 
                      dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="">Select a league</option>
                    {leagues.map((league, idx) => (
                      <option key={idx} value={`${league.id}|${league.name}`}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLeagueMode(true);
                      setSelectedLeagueId("");
                      setSelectedLeagueName("");
                    }}
                    className="mt-2 text-xs text-blue-400 hover:underline"
                  >
                    + Custom League
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={customLeague}
                    onChange={handleCustomLeagueChange}
                    placeholder="Enter custom league/tournament"
                    className="block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 text-sm
                      focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 
                      dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLeagueMode(false);
                      setCustomLeague("");
                    }}
                    className="mt-2 text-xs text-red-400 hover:underline"
                  >
                    ← Back to League List
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Opponent */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-300">Opponent</label>
            {!customOpponentMode ? (
              <>
                <select
                  value={selectedOpponent}
                  onChange={(e) => {
                    setSelectedOpponent(e.target.value);
                    const [id, name] = e.target.value.split("|");
                    setSelectedOpponentId(id);
                    setSelectedOpponentName(name);
                    setCustomOpponent("");
                  }}
                  className="block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 text-sm 
                             focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 
                             dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="">Select an opponent</option>
                  {teams.map((team, idx) => (
                    <option key={idx} value={`${team.id}|${team.name}`}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setCustomOpponentMode(true);
                    setSelectedOpponentId("");
                    setSelectedOpponentName("");
                  }}
                  className="mt-2 text-xs text-blue-400 hover:underline"
                >
                  + Custom Opponent
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={customOpponent}
                  onChange={(e) => setCustomOpponent(e.target.value)}
                  placeholder="Enter custom opponent"
                  className="block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 
                             text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 
                             dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomOpponentMode(false);
                    setCustomOpponent("");
                  }}
                  className="mt-2 text-xs text-red-400 hover:underline"
                >
                  ← Back to Opponent List
                </button>
              </>
            )}

            {/* Groups (from user's team) */}
            {groups.length > 0 && (
              <div className="mt-3">
                <label className="block mb-1 text-xs font-semibold text-gray-300">
                  Team Group ({userTeamName})
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="block w-full p-2 text-gray-900 border border-gray-700 rounded-lg bg-gray-100 text-sm
                             focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 
                             dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="">Select group (optional)</option>
                  {groups.map((group, idx) => (
                    <option key={idx} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Away Team Color Picker */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-300">Away Team Color</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                "#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#6366F1", "#EC4899", "#64748B"
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    awayTeamColor === color ? "border-white scale-110 shadow-lg" : "border-gray-500"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAwayTeamColor(color)}
                  aria-label={`Select color ${color}`}
                >
                  {awayTeamColor === color && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles & Logo */}
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-200 font-medium">Player Stats</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={playerStatsEnabled}
                  onChange={(e) => setPlayerStatsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all" />
              </label>
            </div>

            <div
              className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center px-4 py-3 cursor-pointer relative min-h-[56px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {opponentLogo ? (
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <img
                    src={opponentLogo}
                    alt="Opponent Logo"
                    className="h-full w-full object-contain rounded-full border border-gray-700"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpponentLogo(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow"
                  >
                    <FontAwesomeIcon className="w-4" icon={faTrash} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center text-gray-300 cursor-pointer">
                  <FontAwesomeIcon icon={faUpload} className="text-lg mb-1" />
                  <span className="text-xs">Logo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {user && (
              <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-200 font-medium">Broadcast</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    checked={broadcastToggle}
                    onChange={(e) => setBroadcastToggle(e.target.checked)}
                    type="checkbox"
                    className="sr-only peer"
                  />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all" />
                </label>
              </div>
            )}
          </div>

          {/* ---------- NEW: Pre-game Card toggle + fields ---------- */}
          <div className="bg-gray-800 rounded-lg flex items-center justify-between px-4 py-3 mt-1">
            <span className="text-sm text-gray-200 font-medium">Pre-game Card</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPreGameCard}
                onChange={(e) => setShowPreGameCard(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all" />
            </label>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ease-out
            ${showPreGameCard ? "max-h-[1200px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>

            {(["home","away"]).map((teamKey) => (
              <div key={teamKey} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    {teamKey === "home" ? (homeName || "Home") : (awayName || "Away")}
                  </h3>
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">
                    {teamKey === "home" ? "HOME" : "AWAY"}
                  </span>
                </div>

                {/* PPG / PAPG / DIFF */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { k: "ppg", label: "Points / Game" },
                    { k: "papg", label: "Points Allowed" },
                    { k: "diff", label: "Point Diff." },
                  ].map(({ k, label }) => (
                    <div key={k} className="flex flex-col">
                      <label className="text-[11px] text-gray-400 mb-1">{label}</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
                        value={preGame[teamKey][k]}
                        onChange={e => setPre(`${teamKey}.${k}`, e.target.value)}
                        placeholder="—"
                      />
                    </div>
                  ))}
                </div>

                {/* Recent Form */}
                <div className="mt-4">
                  <label className="text-[11px] text-gray-400 mb-1 block">Recent Form (last 5)</label>
                  <FormRow teamKey={teamKey} />
                </div>

                {/* Record W-L */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1">Wins</label>
                    <input
                      type="number"
                      className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
                      value={preGame[teamKey].record.wins}
                      onChange={e => setPre(`${teamKey}.record.wins`, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1">Losses</label>
                    <input
                      type="number"
                      className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
                      value={preGame[teamKey].record.losses}
                      onChange={e => setPre(`${teamKey}.record.losses`, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Head-to-Head */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Head-to-Head</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 mb-1">Total Games (opt.)</label>
                  <input
                    type="number"
                    className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
                    value={preGame.totalGames}
                    onChange={e => setPre("totalGames", e.target.value)}
                    placeholder="e.g. 6"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1">{homeName || "Home"} Wins</label>
                  <input
                    type="number"
                    className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
                    value={preGame.home.h2hWins}
                    onChange={e => setPre("home.h2hWins", e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1">{awayName || "Away"} Wins</label>
                  <input
                    type="number"
                    className="w-full px-2 py-2 rounded-md bg-gray-900/60 border border-gray-700 text-sm text-white"
                    value={preGame.away.h2hWins}
                    onChange={e => setPre("away.h2hWins", e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* ---------- END Pre-game Card section ---------- */}

          {/* Lineout selection */}
          {playerStatsEnabled && (
            <div className="bg-gray-800 rounded-lg p-4 mt-2">
              <label className="block text-xs font-semibold text-gray-300 mb-2">Select Lineout</label>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  {lineouts.length > 0 ? (
                    <select
                      value={selectedLineout || ""}
                      onChange={(e) => setSelectedLineout(e.target.value)}
                      className="block w-full p-2 text-black bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    >
                      {lineouts.map((lineout) => (
                        <option key={lineout.id} value={lineout.id}>
                          {lineout.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-400">None</p>
                  )}
                </div>
                <div className="flex-1 w-full flex items-center justify-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      checked={minutesTracked}
                      onChange={(e) => setMinutesTracked(e.target.checked)}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all" />
                    <span className="ml-3 text-xs font-medium text-gray-200">Timer</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Venue + Start */}
        <div className="flex flex-col md:flex-row gap-4 mt-6 items-center">
          <div className="flex-1 bg-gray-800 rounded-lg flex overflow-hidden relative h-16">
            <div
              className={`absolute top-0 left-0 h-full w-1/2 bg-white rounded-lg transition-transform duration-300 ease-in-out ${
                selectedVenue === "away" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <div
              className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
              onClick={() => venueSelectedHandler("home")}
            >
              <button className={`px-4 py-2 rounded ${selectedVenue === "home" ? "text-gray-800 font-bold" : "text-white"}`}>Home</button>
            </div>
            <div
              className="z-10 w-1/2 h-full flex justify-center items-center cursor-pointer"
              onClick={() => venueSelectedHandler("away")}
            >
              <button className={`px-4 py-2 rounded ${selectedVenue === "away" ? "text-gray-800 font-bold" : "text-white"}`}>Away</button>
            </div>
          </div>

          <button
            disabled={!isOpponentValid}
            onClick={handleGameStart}
            className={`px-4 py-4 rounded ${
              isOpponentValid
                ? "bg-primary-cta text-white hover:bg-blue-700"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
