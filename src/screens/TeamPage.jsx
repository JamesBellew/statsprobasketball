import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';// Adjust path as needed
import jerseyPlaceholder from '../assets/logo.jpg'; // Adjust path as needed

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
            const oppScore = isTeamHome ? game.score?.away : game.score?.home;

            filtered.push({
              result: teamScore > oppScore ? 'W' : 'L',
              createdAt: game.createdAt ?? 0 // fallback if missing
            });
          }
        });

        // Sort by most recent (descending)
        filtered.sort((a, b) => b.createdAt - a.createdAt);

        // Take latest 4
        setResults(filtered.slice(0, 4));
      } catch (error) {
        console.error("Error fetching recent results:", error);
      }
    };

    if (teamName) fetchResults();
  }, [teamName]);

  return (
    <div className='flex flex-row space-x-1 mt-2'>
      {results.map((item, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-full text-center my-auto flex items-center justify-center font-normal text-[8px] ${
            item.result === 'W'
              ? 'bg-white text-primary-cta'
              : 'bg-black/10 border-[1px] border-gray-500 text-white'
          }`}
        >
          <p>{item.result}</p>
        </div>
      ))}
    </div>
  );
};



// Team Live Games Component
const TeamLiveGames = ({ teamName }) => {
  const navigate = useNavigate();
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamLiveGames = async () => {
      try {
        setLoading(true);
        
        // Query live games where the team is either home or away
        const liveGamesRef = collection(firestore, "liveGames");
        const liveGamesSnapshot = await getDocs(liveGamesRef);
        
        const teamGames = [];
        liveGamesSnapshot.forEach((doc) => {
          const game = { id: doc.id, ...doc.data() };
          
          // Check if this team is playing in this game
          const isHomeTeam = game.homeTeamName === teamName;
          const isAwayTeam = game.teamNames?.away === teamName || game.teamNames?.home === teamName;
          
          if (isHomeTeam || isAwayTeam) {
            teamGames.push(game);
          }
        });
        
        setLiveGames(teamGames);
      } catch (error) {
        console.error("Error fetching team live games:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teamName) {
      fetchTeamLiveGames();
    }
  }, [teamName]);

const handleLiveGameClick = (gameSlug) => {
    // Handle both full URLs and just slugs
    const slug = gameSlug.includes('http') 
        ? new URL(gameSlug).pathname.split('/').pop()
        : gameSlug;
    navigate(`/liveGames/${slug}`);
};

  if (loading) {
    return (
      <div className="text-center py-8 bg-white/10 rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
        <p className="text-white/80">Loading live games...</p>
      </div>
    );
  }

  if (liveGames.length === 0) {
    return (
      <div className="text-center py-8 bg-white/10 rounded-lg">
        <p className="text-white/80">No live games for this team</p>
        <p className="text-white/60 text-sm mt-2">Check back when games are in progress</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

      {liveGames.map((game) => {
        const homeScore = game.score?.home ?? 0;
        const awayScore = game.score?.away ?? 0;
        
        // Determine home and away teams
        let homeTeam, homeLogo, homeColor, awayTeam, awayLogo, awayColor;
        
        if (game.homeTeamName === teamName) {
          homeTeam = game.homeTeamName;
          homeLogo = game.logos?.home || jerseyPlaceholder;
          homeColor = game.homeTeamColor || '#8B5CF6';
          awayTeam = game.teamNames?.away || 'Away Team';
          awayLogo = game.logos?.away || jerseyPlaceholder;
          awayColor = game.awayTeamColor || '#0b63fb';
        } else {
          homeTeam = game.teamNames?.home || 'Home Team';
          homeLogo = game.logos?.home || jerseyPlaceholder;
          homeColor = game.homeTeamColor || '#8B5CF6';
          awayTeam = teamName;
          awayLogo = game.logos?.away || jerseyPlaceholder;
          awayColor = game.awayTeamColor || '#0b63fb';
        }
  
        return (
          <div
            key={game.id}
            onClick={() => handleLiveGameClick(game.link)}
            className="w-full cursor-pointer hover:scale-[0.98] transition-all duration-300"

          >
            <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600">
              
              {/* Grid layout with 3 equal columns */}
              <div className="grid grid-cols-3 items-center gap-2">
                {/* Away Team Section */}
                <div className="flex flex-col items-center">
                  {/* Away Team Logo */}
                  <div className="relative mb-2">
                    <img
                      src={awayLogo}
                      className="w-10 h-10 rounded-full bg-white p-0.5"
                      alt="away logo"
                    />
                    <div 
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: awayColor }}
                    />
                  </div>
                  {/* Away Team Name */}
                  <div className="text-center">
                    <p className="text-white font-medium text-sm truncate max-w-[120px]">{awayTeam}</p>
                    <p className="text-gray-400 text-xs">Away</p>
                  </div>
                </div>
  
                {/* Score Section - Fixed center */}
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{awayScore} - {homeScore}</p>
                  {/* <p className="text-xs text-gray-300 mt-1">Click to View</p> */}
                </div>
  
                {/* Home Team Section */}
                <div className="flex flex-col items-center">
                  {/* Home Team Logo */}
                  <div className="relative mb-2">
                    <img
                      src={homeLogo}
                      className="w-10 h-10 rounded-full bg-white p-0.5"
                      alt="home logo"
                    />
                    <div 
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: homeColor }}
                    />
                  </div>
                  {/* Home Team Name */}
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
                  background: `linear-gradient(to right, ${awayColor} 0%, ${awayColor} 50%, ${homeColor} 50%, ${homeColor} 100%)` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

function TeamPage() {
  const { teamName } = useParams();
  const navigate = useNavigate();
  const [isValidTeam, setIsValidTeam] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ✅ Add React state for mobile menu

  useEffect(() => {
    const validateTeamFromDatabase = async () => {
      try {
        setLoading(true);
        
        // Fetch all teams from Firestore
        const teamsRef = collection(firestore, "Teams");
        const teamsSnapshot = await getDocs(teamsRef);
        
        if (teamsSnapshot.empty) {
          console.log("No teams found in database");
          setIsValidTeam(false);
          setLoading(false);
          return;
        }

        // Check if the team exists in the database
        let foundTeam = null;
        teamsSnapshot.forEach((doc) => {
          const team = doc.data();
          // Case-insensitive comparison and trim whitespace
          if (team.Name && team.Name.toLowerCase().trim() === teamName?.toLowerCase().trim()) {
            foundTeam = { id: doc.id, ...team };
          }
        });

        if (foundTeam && teamName && teamName !== 'Home') {
          setIsValidTeam(true);
          setTeamData(foundTeam);
        } else {
          setIsValidTeam(false);
          setTeamData(null);
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
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };
  // Loading state
  if (loading || isValidTeam === null) {
    return (
      <div className="min-h-screen bg-primary-cta  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading team information...</p>
        </div>
      </div>
    );
  }

  // Error state - invalid team
  if (!isValidTeam) {
    return (
      <div className="min-h-screen bg-secondary-bg">
        
        {/* Hero Section - Error State */}
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
                <p className="text-white/80 text-lg mb-6">
                 
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
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0">
              <div className="text-white text-9xl font-bold transform rotate-12 translate-x-32 translate-y-8">404</div>
            </div>
          </div>
        </div>

        {/* Placeholder sections to maintain layout */}
        <div className="px-4 flex justify-center items-center flex-col my-auto mb-6">
          <h2 className="text-white text-sm font-semibold mb-2 uppercase tracking-wide text-center my-auto mt-5">Want to manage "{teamName}"</h2>
          <h3 className="text-white text-sm font-semibold mb-1 capitalize tracking-wide text-center my-auto mt-5">Request an account to manage "{teamName}"</h3>
          <div className="text-center py-8">
            {/* <p className="text-white/60">Browse available teams from the home page</p> */}
            <br></br>
            <a 
                    href='https://www.instagram.com/james_bellew97/?hl=en'
                    className="px-6 py-3 bg-primary-cta text-white rounded-lg font-semibold hover:bg-secondary-cta transition-colors"
                  >
                   Request account
                  </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state - valid team with new UI
  return (
    <div className="min-h-screen bg-secondary-bg bg-[url('/assets/bg-pattern.svg')]
      bg-repeat bg-[length:150px_150px]">
        

        <header className=" h-full w-full  bg-primary-cta  z-50">

        <div className="container px-2 mx-auto">
          <div className="flex  cursor-pointer justify-between items-center py-4 mx-auto">
            <a onClick={() => { navigate("/liveGameHomeDashboard") }} className="text-xl font-bold text-white">
              StatsPro <span className=" text-black">|</span> <span className="text-sm text-gray-200">Basketball</span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6 text-gray-300 text-sm">
              <a onClick={() => { navigate('/') }} className="hover:text-white">Home</a>
              <a onClick={()=>{
                navigate('/liveGameHomeDashboard')
              }} className="hover:text-white border-b-2 border-b-primary-cta pb-1">LiveGames</a>
            </nav>

            {/* Mobile Hamburger - ✅ Use React onClick instead of DOM manipulation */}
            <button 
              onClick={handleOpenMobileMenu}
              className="text-white md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        </div>
 
      </header>

      {/* ✅ Mobile Menu - Use React state and conditional rendering */}
      <div 
        className={`fixed inset-0 bg-primary-bg bg-opacity-98 md:hidden z-50 transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => {
          // Close menu when clicking outside
          if (e.target === e.currentTarget) {
            handleCloseMobileMenu();
          }
        }}
      >
        <div className="flex flex-col justify-between h-full p-6 text-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">StatsPro</h2>
            <button 
              onClick={handleCloseMobileMenu}
              className="text-2xl text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <nav className="space-y-6 text-lg">
            <a onClick={() => {
              navigate('/');
              handleCloseMobileMenu(); // Close menu after navigation
            }} className="block hover:text-blue-400">Home</a>
            <a onClick={()=>{
              navigate("/../liveGameHomeDashboard")
            }} className="block hover:text-blue-400 text-white ">Live Games</a>
             <a  className="block hover:text-blue-400 text-white border-l-2 border-l-primary-cta pl-4">Teams</a>
          </nav>
          <div>
          <div className="block text-center text-blue-500 font-semibold text-gray-400 py-3 rounded-s-lg">
     StatsPro | Basketball<br></br> Beta
      </div>
          </div>
        </div>
      </div>




      {/* Hero Section - Team Welcome */}
      <div className="mb-6">
        <div 
          className="relative bg-primary-cta bg-[url('/assets/bg6.svg')]
      bg-cover bg-[length:550px_550px] overflow-hidden h-auto py-20 p-8 pt-12 rounded-b-2xl"
        //   style={{ 
        //     background: teamData?.Color ? 
        //       `linear-gradient(to right, ${teamData.Color}, ${teamData.Color}dd)` : 
        //       'linear-gradient(to right, rgb(59 130 246), rgb(147 51 234))'
        //   }}
        >
          <div className="flex container mx-auto items-center justify-between h-full">
            <div className="flex-1 z-10">
              <h1 className="text-white text-3xl font-bold mb-2 leading-tight">
            
                <br />
                {teamData?.Name || teamName}
                <br />
  {/* <p className='text-sm font-normal'>Dundalk, Louth</p> */}
              </h1>
              {/* <div className='flex flex-row space-x-1'>
              <div className='w-4 h-4 rounded-full bg-white text-center my-auto flex items-center justify-center font-normal text-[8px] text-primary-cta'><p>W</p></div>
              <div className='w-4 h-4 rounded-full bg-white text-center my-auto flex items-center justify-center font-normal text-[8px] text-primary-cta'><p>W</p></div>
              <div className='w-4 h-4 rounded-full bg-white text-center my-auto flex items-center justify-center font-normal text-[8px] text-primary-cta'><p>W</p></div>
              <div className='w-4 h-4 rounded-full bg-black/10 border-[1px] border-gray-500 text-center my-auto flex items-center justify-center font-normal text-[8px] text-white'><p>L</p>
              </div>
              </div> */}
            <RecentResults teamName={teamData?.Name || teamName} />

              <div className="w-12 mt-4 h-1 bg-white rounded-full"></div>
            </div>
            <div className="absolute bg-white/50 rounded-full right-8 top-1/2 transform -translate-y-1/2">
              {teamData?.Image ? (
                <img 
                  src={teamData.Image} 
                  alt={`${teamData.Name} logo`}
                  className="w-32 h-32 p-2 rounded-full object-cover  border-white shadow-lg"
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
          {/* Background pattern */}
          {/* <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0">
            <div className="text-white text-9xl font-bold transform rotate-12 translate-x-32 translate-y-8">
              {(teamData?.Name || teamName)?.substring(0, 4)?.toUpperCase() || 'MVP'}
            </div>
          </div> */}
        </div>
      </div>

      {/* Team Live Games */}
      <div className="px-4 mb-6 container mx-auto">
        <h2 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Matches</h2>
        <TeamLiveGames teamName={teamData?.Name || teamName} />
      </div>



      {/* Team Information Cards */}
      {/* <div className="px-4 mb-6">
        <h2 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Team Information</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="min-w-[200px] bg-white flex-shrink-0 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-2">{teamData?.Name || teamName}</div>
              <div className="text-sm text-gray-500 mb-4">Official Team Page</div>
              {teamData?.Color && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600">Team Color:</span>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: teamData.Color }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-[160px] bg-white flex-shrink-0 rounded-lg p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 mb-2">Team Stats</div>
              <div className="space-y-2">
                <div>
                  <div className="text-lg font-bold">0</div>
                  <div className="text-xs text-gray-500">Games Played</div>
                </div>
                <div>
                  <div className="text-lg font-bold">0</div>
                  <div className="text-xs text-gray-500">Wins</div>
                </div>
              </div>
            </div>
          </div>

          {teamData?.CreatedAt && (
            <div className="min-w-[160px] bg-white flex-shrink-0 rounded-lg p-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 mb-2">Team Founded</div>
                <div className="text-sm text-gray-600">
                  {new Date(teamData.CreatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div> */}



      {/* Recent Games */}
      {/* <div className="px-4 pb-8">
        <h2 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Recent Games</h2>
        <div className="text-center py-8 bg-white/10 rounded-lg">
          <p className="text-white/80">No recent games to display</p>
          <p className="text-white/60 text-sm mt-2">Game history will appear here once games are played</p>
        </div>
      </div> */}

      {/* Action Buttons */}
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
            className="px-6 py-3 bg-white text-black  rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Live Games
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;