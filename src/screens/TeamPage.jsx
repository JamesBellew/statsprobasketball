// TeamPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase'; // Adjust path as needed
import jerseyPlaceholder from '../assets/logo.jpg'; // Adjust path as needed

// ------- Recent Results (WWWL circles) -------
const RecentResults = ({ teamName }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const gamesRef = collection(firestore, "liveGames");
        const snapshot = await getDocs(gamesRef);
        const filtered = [];

        snapshot.forEach((doc) => {
          const game = { id: doc.id, ...doc.data() };

          const isTeamHome = game.homeTeamName === teamName;
          const isTeamAway = game.teamNames?.away === teamName;

          // Only consider finished games
          if (game.gameState === true && (isTeamHome || isTeamAway)) {
            const teamScore = isTeamHome ? game.score?.home : game.score?.away;
            const oppScore  = isTeamHome ? game.score?.away : game.score?.home;

            filtered.push({
              result: teamScore > oppScore ? 'W' : 'L',
              createdAt: game.createdAt ?? 0
            });
          }
        });

        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setResults(filtered.slice(0, 4));
      } catch (error) {
        console.error("Error fetching recent results:", error);
      }
    };

    if (teamName) fetchResults();
  }, [teamName]);

  return (
    <div className="flex flex-row space-x-1 mt-2">
      {results.map((item, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-full text-center my-auto flex items-center justify-center font-normal text-[8px] ${
            item.result === 'W'
              ? 'bg-white text-primary-cta'
              : 'bg-black/10 border border-gray-500 text-white'
          }`}
        >
          <p>{item.result}</p>
        </div>
      ))}
    </div>
  );
};

// ---------------- Team Live Games (grouped + live card) ----------------
const TeamLiveGames = ({ teamName, selectedFilter = "All Teams", onGroupsChange }) => {
  const navigate = useNavigate();
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamLiveGames = async () => {
      try {
        setLoading(true);

        const liveGamesRef = collection(firestore, "liveGames");
        const liveGamesSnapshot = await getDocs(liveGamesRef);

        const teamGames = [];
        liveGamesSnapshot.forEach((docSnap) => {
          const game = { id: docSnap.id, ...docSnap.data() };

          const isHomeTeam = game.homeTeamName === teamName;
          const isAwayTeam =
            game.teamNames?.away === teamName || game.teamNames?.home === teamName;

          if (isHomeTeam || isAwayTeam) teamGames.push(game);
        });

        const groupsPresent = Array.from(
          new Set(teamGames.map((g) => g.opponentGroup).filter(Boolean))
        );
        if (typeof onGroupsChange === "function") onGroupsChange(groupsPresent);

        setLiveGames(teamGames);
      } catch (error) {
        console.error("Error fetching team live games:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teamName) fetchTeamLiveGames();
  }, [teamName, onGroupsChange]);

  const handleLiveGameClick = (gameSlugOrLink) => {
    const slug = gameSlugOrLink?.includes?.("http")
      ? new URL(gameSlugOrLink).pathname.split("/").pop()
      : gameSlugOrLink;
    if (!slug) return;
    navigate(`/liveGames/${slug}`);
  };

  // Apply group filter
  const filteredGames =
    selectedFilter === "All Teams"
      ? liveGames
      : liveGames.filter((g) => g.opponentGroup === selectedFilter);

  // Live if gameState === false
  const liveNow = filteredGames.filter((g) => g.gameState === false);
  const notLive = filteredGames.filter((g) => g.gameState !== false);

  if (loading) {
    return (
      <div className="text-center py-8 bg-white/10 rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
        <p className="text-white/80">Loading games...</p>
      </div>
    );
  }

  if (filteredGames.length === 0) {
    return (
      <div className="text-center py-8 bg-white/10 rounded-lg">
        {selectedFilter === "All Teams" ? (
          <>
            <p className="text-white/80">No games for this team</p>
            <p className="text-white/60 text-sm mt-2">Check back later</p>
          </>
        ) : (
          <p className="text-white/80">No “{selectedFilter}” games found</p>
        )}
      </div>
    );
  }

  // --------- Card renderers ----------
  const renderDefaultCard = (game) => {
    const homeScore = game.score?.home ?? 0;
    const awayScore = game.score?.away ?? 0;

    let homeTeam, homeLogo, homeColor, awayTeam, awayLogo, awayColor;
    if (game.homeTeamName === teamName) {
      homeTeam  = game.homeTeamName;
      homeLogo  = game.logos?.home || jerseyPlaceholder;
      homeColor = game.homeTeamColor || "#8B5CF6";
      awayTeam  = game.teamNames?.away || "Away Team";
      awayLogo  = game.logos?.away || jerseyPlaceholder;
      awayColor = game.awayTeamColor || "#0b63fb";
    } else {
      homeTeam  = game.teamNames?.home || "Home Team";
      homeLogo  = game.logos?.home || jerseyPlaceholder;
      homeColor = game.homeTeamColor || "#8B5CF6";
      awayTeam  = teamName;
      awayLogo  = game.logos?.away || jerseyPlaceholder;
      awayColor = game.awayTeamColor || "#0b63fb";
    }

    return (
      <div
        key={game.id}
        onClick={() => handleLiveGameClick(game.link || game.slug || game.id)}
        className="w-full cursor-pointer hover:scale-[0.98] transition-all duration-300"
      >
        <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600">
          {game.opponentGroup && (
            <span className="absolute top-3 right-3 bg-white/10 text-gray-100 text-xs font-medium px-2.5 py-0.5 rounded-sm">
              {game.opponentGroup}
            </span>
          )}

          <div className="grid grid-cols-3 items-center gap-2">
            {/* Away */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img src={awayLogo} className="w-10 h-10 rounded-full bg-white p-0.5" alt="away logo" />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: awayColor }}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm truncate max-w-[120px]">{awayTeam}</p>
                <p className="text-gray-400 text-xs">Away</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <p className="text-xl font-bold text-white">{awayScore} - {homeScore}</p>
            </div>

            {/* Home */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img src={homeLogo} className="w-10 h-10 rounded-full bg-white p-0.5" alt="home logo" />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: homeColor }}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm truncate max-w-[120px]">{homeTeam}</p>
                <p className="text-gray-400 text-xs">Home</p>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div
            className="absolute bottom-0 left-0 w-full h-1 rounded-b-xl"
            style={{
              background: `linear-gradient(to right, ${awayColor} 0%, ${awayColor} 50%, ${homeColor} 50%, ${homeColor} 100%)`,
            }}
          />
        </div>
      </div>
    );
  };

  const renderLiveCard = (game) => {
    const homeScore = game.score?.home ?? 0;
    const awayScore = game.score?.away ?? 0;
    const currentQ = game.quarter ?? 1;
    const groupLabel = game.opponentGroup ?? "";

    let homeTeam, homeLogo, homeColor, awayTeam, awayLogo, awayColor;
    if (game.homeTeamName === teamName) {
      homeTeam  = game.homeTeamName;
      homeLogo  = game.logos?.home || jerseyPlaceholder;
      homeColor = game.homeTeamColor || "#8B5CF6";
      awayTeam  = game.teamNames?.away || "Away Team";
      awayLogo  = game.logos?.away || jerseyPlaceholder;
      awayColor = game.awayTeamColor || "#0b63fb";
    } else {
      homeTeam  = game.teamNames?.home || "Home Team";
      homeLogo  = game.logos?.home || jerseyPlaceholder;
      homeColor = game.homeTeamColor || "#8B5CF6";
      awayTeam  = teamName;
      awayLogo  = game.logos?.away || jerseyPlaceholder;
      awayColor = game.awayTeamColor || "#0b63fb";
    }

    const safeAwayLogo = awayLogo;
    const safeHomeLogo = homeLogo;

    return (
      <a
        key={game.id}
        onClick={() => handleLiveGameClick(game.link || game.slug || game.id)}
        className="block group cursor-pointer"
      >
        <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
          {/* Base gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

          {/* Team color radial gradients */}
          <div
            className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50"
            style={{
              background: `radial-gradient(circle at 20% 50%, ${awayColor}15 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${homeColor}15 0%, transparent 50%)`,
            }}
          />

          {/* Dot pattern texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Edge accents */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom, transparent, ${awayColor} 30%, ${awayColor} 70%, transparent)`,
              boxShadow: `2px 0 12px ${awayColor}60`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom, transparent, ${homeColor} 30%, ${homeColor} 70%, transparent)`,
              boxShadow: `-2px 0 12px ${homeColor}60`,
            }}
          />

          {/* Borders */}
          <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-300" />
          <div
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{
              background: `linear-gradient(135deg, ${awayColor}20 0%, transparent 30%, transparent 70%, ${homeColor}20 100%)`,
              maskImage: "linear-gradient(to bottom, transparent, black 2px, black calc(100% - 2px), transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 2px, black calc(100% - 2px), transparent)",
            }}
          />

          {/* Main content */}
          <div className="relative backdrop-blur-xl bg-black/20 p-4">
            {/* LIVE badge */}
            <div className="absolute left-0 top-0 z-40">
              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-semibold px-3 py-1 rounded-br-lg rounded-tl-2xl flex items-center space-x-1.5 shadow-lg shadow-red-500/30">
                <span>LIVE</span>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Group pill */}
            {groupLabel && (
              <div className="absolute right-3 top-3 z-40">
                <span
                  title={groupLabel}
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium leading-none text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 max-w-[160px] truncate shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7.5 9a7.5 7.5 0 0115 0H4.5z" />
                  </svg>
                  <span className="truncate">{groupLabel}</span>
                </span>
              </div>
            )}

            {/* Teams + Score */}
            <div className="pt-8">
              <div className="flex items-center justify-between px-2">
                {/* Away */}
                <div className="w-24 flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="relative w-12 h-12">
                      <div
                        className="absolute -inset-2 rounded-full opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-50"
                        style={{ background: `radial-gradient(circle, ${awayColor}, transparent 70%)` }}
                      />
                      <div
                        className="absolute inset-0 rounded-full transition-all duration-300"
                        style={{ boxShadow: `0 0 0 2px transparent, 0 0 0 4px ${awayColor}40` }}
                      />
                      <img
                        src={safeAwayLogo || "/placeholder.svg"}
                        alt={`${awayTeam} logo`}
                        className="relative w-12 h-12 rounded-full bg-white p-1 shadow-xl"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 shadow-lg"
                        style={{ backgroundColor: awayColor }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm truncate max-w-[90px]" title={awayTeam}>
                      {awayTeam}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Away</p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex-1 text-center mx-4 min-w-[120px]">
                  <div className="relative inline-block">
                    <div
                      className="absolute inset-0 rounded-lg opacity-20 blur-md"
                      style={{ background: `linear-gradient(90deg, ${awayColor}40, ${homeColor}40)` }}
                    />
                    <p className="relative text-2xl font-bold text-white tracking-tight px-4 py-1 whitespace-nowrap">
                      {awayScore} - {homeScore}
                    </p>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-xs font-medium text-gray-200">
                      {currentQ > 4 ? `OT ${currentQ - 4}` : `Q${currentQ}`}
                    </p>
                  </div>
                </div>

                {/* Home */}
                <div className="w-24 flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="relative w-12 h-12">
                      <div
                        className="absolute -inset-2 rounded-full opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-50"
                        style={{ background: `radial-gradient(circle, ${homeColor}, transparent 70%)` }}
                      />
                      <div
                        className="absolute inset-0 rounded-full transition-all duration-300"
                        style={{ boxShadow: `0 0 0 2px transparent, 0 0 0 4px ${homeColor}40` }}
                      />
                      <img
                        src={safeHomeLogo || "/placeholder.svg"}
                        alt={`${homeTeam} logo`}
                        className="relative w-12 h-12 rounded-full bg-white p-1 shadow-xl"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 shadow-lg"
                        style={{ backgroundColor: homeColor }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm truncate max-w-[90px]" title={homeTeam}>
                      {homeTeam}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Home</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    );
  };
  // --------- /Card renderers ----------

  return (
    <div className="space-y-6">
      {/* Live section */}
      {liveNow.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wide">Live</h3>
            <span className="inline-flex items-center text-[10px] font-semibold bg-red-500/15 text-red-400 px-2 py-0.5 rounded">
              LIVE
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveNow.map(renderLiveCard)}
          </div>
        </section>
      )}

      {/* Not live section */}
      {notLive.length > 0 && (
        <section>
          <div className="mb-2">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wide">Games</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notLive.map(renderDefaultCard)}
          </div>
        </section>
      )}
    </div>
  );
};

// ----------------------------- Team Page -----------------------------
function TeamPage() {
  const { teamName } = useParams();
  const navigate = useNavigate();
  const [isValidTeam, setIsValidTeam] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const TEAM_GROUPS = [
    "All Teams",
    "Senior Mens 2025",
    "U18s Boys",
    "U16s Girls",
    "Senior Womens 2025",
    "U20s Mixed",
    "Junior Boys",
    "Junior Girls",
    "Veterans",
    "Development Squad",
  ];
  const [teamGroups, setTeamGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);

  const [selectedFilter, setSelectedFilter] = useState("All Teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setShowFilters(false);
  };
  const clearFilters = () => {
    setSelectedFilter("All Teams");
    setSearchQuery("");
  };

  useEffect(() => {
    const validateTeamFromDatabase = async () => {
      try {
        setLoading(true);
        const teamsRef = collection(firestore, "Teams");
        const teamsSnapshot = await getDocs(teamsRef);

        if (teamsSnapshot.empty) {
          setIsValidTeam(false);
          setLoading(false);
          return;
        }

        let foundTeam = null;
        teamsSnapshot.forEach((doc) => {
          const team = doc.data();
          if (team.Name && team.Name.toLowerCase().trim() === teamName?.toLowerCase().trim()) {
            foundTeam = { id: doc.id, ...team };
          }
        });

        if (foundTeam && teamName && teamName !== 'Home') {
          setIsValidTeam(true);
          setTeamData(foundTeam);
          setTeamGroups(Array.isArray(foundTeam.groups) ? foundTeam.groups : []);
        } else {
          setIsValidTeam(false);
          setTeamData(null);
          setTeamGroups([]);
        }
      } catch (error) {
        console.error("Error fetching teams from database:", error);
        setIsValidTeam(false);
      } finally {
        setLoading(false);
      }
    };

    validateTeamFromDatabase();
  }, [teamName]);

  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);
  const handleOpenMobileMenu  = () => setIsMobileMenuOpen(true);

  // Loading state
  if (loading || isValidTeam === null) {
    return (
      <div className="min-h-screen bg-primary-cta flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading team information...</p>
        </div>
      </div>
    );
  }

  // Error / invalid team
  if (!isValidTeam) {
    return (
      <div className="min-h-screen bg-secondary-bg">
        <div className="mb-6">
          <div className="relative bg-primary-bg overflow-hidden h-80 p-8 pt-12 rounded-b-2xl">
            <div className="flex items-center justify-center h-full">
              <div className="text-center z-10">
                <h1 className="text-white text-3xl font-bold mb-4 leading-tight">
                  Team Not Found
                </h1>
                <p className="text-white/80 text-lg mb-6">
                  The team "{teamName}" has not been created yet on our app
                </p>
                <div className="space-x-4">
                  <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Go Back Home
                  </button>
                  <button 
                    onClick={() => navigate('/teamsDashboard')}
                    className="px-6 py-3 bg-primary-cta text-white rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    View Teams
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0">
              <div className="text-white text-9xl font-bold transform rotate-12 translate-x-32 translate-y-8">404</div>
            </div>
          </div>
        </div>

        <div className="px-4 flex justify-center items-center flex-col my-auto mb-6">
          <h2 className="text-white text-sm font-semibold mb-2 uppercase tracking-wide text-center mt-5">
            Want to manage "{teamName}"
          </h2>
          <h3 className="text-white text-sm font-semibold mb-1 capitalize tracking-wide text-center mt-5">
            Request an account to manage "{teamName}"
          </h3>
          <div className="text-center py-8">
            <br />
            <a 
              href="https://www.instagram.com/james_bellew97/?hl=en"
              className="px-6 py-3 bg-primary-cta text-white rounded-lg font-semibold hover:bg-secondary-cta transition-colors"
            >
              Request account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state - valid team
  return (
    <div className="min-h-screen bg-secondary-bg bg-[url('/assets/bg-pattern.svg')] bg-repeat bg-[length:150px_150px]">
      {/* Header */}
      <header className="w-full bg-primary-cta z-50">
        <div className="container px-2 mx-auto">
          <div className="flex cursor-pointer justify-between items-center py-4 mx-auto">
            <a onClick={() => { navigate("/liveGameHomeDashboard"); }} className="text-xl font-bold text-white">
              StatsPro <span className="text-black">|</span> <span className="text-sm text-gray-200">Basketball</span>
            </a>

            <nav className="hidden md:flex space-x-6 text-gray-300 text-sm">
              <a onClick={() => { navigate('/'); }} className="hover:text-white">Home</a>
              <a onClick={() => { navigate('/liveGameHomeDashboard'); }} className="hover:text-white border-b-2 border-b-primary-cta pb-1">
                LiveGames
              </a>
            </nav>

            <button onClick={handleOpenMobileMenu} className="text-white md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-primary-bg bg-opacity-98 md:hidden z-50 transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => { if (e.target === e.currentTarget) handleCloseMobileMenu(); }}
      >
        <div className="flex flex-col justify-between h-full p-6 text-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">StatsPro</h2>
            <button onClick={handleCloseMobileMenu} className="text-2xl text-gray-300 hover:text-white">✕</button>
          </div>
          <nav className="space-y-6 text-lg">
            <a onClick={() => { navigate('/'); handleCloseMobileMenu(); }} className="block hover:text-blue-400">Home</a>
            <a onClick={() => { navigate("/../liveGameHomeDashboard"); }} className="block hover:text-blue-400 text-white ">Live Games</a>
            <a className="block hover:text-blue-400 text-white border-l-2 border-l-primary-cta pl-4">Teams</a>
          </nav>
          <div className="block text-center text-gray-400 py-3">
            StatsPro | Basketball<br /> Beta
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="mb-6">
        <div className="relative bg-primary-cta bg-[url('/assets/bg6.svg')] bg-cover bg-[length:550px_550px] overflow-hidden h-auto py-20 p-8 pt-12 rounded-b-2xl">
          <div className="flex container mx-auto items-center justify-between h-full">
            <div className="flex-1 z-10">
              <h1 className="text-white text-3xl font-bold mb-2 leading-tight">
                <br />
                {teamData?.Name || teamName}
                <br />
              </h1>

              <RecentResults teamName={teamData?.Name || teamName} />
              <div className="w-12 mt-4 h-1 bg-white rounded-full"></div>
            </div>

            <div className="absolute bg-white/50 rounded-full right-8 top-1/2 transform -translate-y-1/2">
              {teamData?.Image ? (
                <img 
                  src={teamData.Image}
                  alt={`${teamData.Name} logo`}
                  className="w-32 h-32 p-2 rounded-full object-cover border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {(teamData?.Name || teamName)?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-6 container mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-lg font-semibold mb-1">Team Groups</h2>
            <p className="text-gray-400 text-sm">Filter teams by category or search</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M10 2a8 8 0 105.293 14.293l3.707 3.707a1 1 0 001.414-1.414l-3.707-3.707A8 8 0 0010 2zm-6 8a6 6 0 1112 0 6 6 0 01-12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`bg-gray-800/50 border text-white px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center ${
                selectedFilter && selectedFilter !== 'All Teams' ? 'border-primary-cta' : 'border-gray-800/50'
              }`}
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5a1 1 0 011-1h16a1 1 0 01.8 1.6l-5.2 6.934V18a1 1 0 01-.553.894l-4 2A1 1 0 019 20v-7.466L3.2 5.6A1 1 0 013 5z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-gray-800/30 rounded-lg p-4 mb-4 border border-gray-700/50">
            <div className="flex flex-wrap gap-2 mb-3">
              {["All Teams", ...availableGroups].map((group) => {
                const active = selectedFilter === group;
                return (
                  <button
                    key={group}
                    onClick={() => handleFilterSelect(group)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      active
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                  >
                    <span className="inline-flex items-center">
                      {group}
                      {active && (
                        <svg className="w-3 h-3 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {(selectedFilter !== "All Teams" || searchQuery) && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                <span className="text-sm text-gray-400">Active filters:</span>
                {selectedFilter !== "All Teams" && (
                  <span className="text-xs px-2 py-1 rounded-full border border-indigo-400 text-indigo-400">
                    {selectedFilter}
                  </span>
                )}
                {searchQuery && (
                  <span className="text-xs px-2 py-1 rounded-full border border-green-400 text-green-400">
                    Search: "{searchQuery}"
                  </span>
                )}
                <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white ml-auto">
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">
            {selectedFilter !== "All Teams" || searchQuery ? (
              <span>Filtered results • {selectedFilter !== "All Teams" ? selectedFilter : "All Teams"}</span>
            ) : (
              <span>Showing all teams</span>
            )}
          </div>
          <div className="text-sm text-gray-500"></div>
        </div>
      </div>

      {/* Matches */}
      <div className="px-4 mb-6 container mx-auto">
        <h2 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Matches</h2>
        <TeamLiveGames
          teamName={teamData?.Name || teamName}
          selectedFilter={selectedFilter}
          onGroupsChange={setAvailableGroups}
        />
      </div>

      {/* Footer buttons */}
      <div className="px-4 pb-8">
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => navigate('/teamsDashboard')}
            className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            Back to Home
          </button>
          <button 
            onClick={() => navigate('../liveGameHomeDashboard')}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Live Games
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
