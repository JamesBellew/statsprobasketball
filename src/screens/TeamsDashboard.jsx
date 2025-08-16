import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function TeamsDashboard() {

    const navigate = useNavigate();
  const firestore = getFirestore(); // ✅ fix: initialize Firestore
  const [basketballTeams, setBasketballTeams] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [teamGameCounts, setTeamGameCounts] = useState({});
  const [teamRecords, setTeamRecords] = useState({});
  const [liveCount,setliveCount] = useState(0)
  const [teamsWithLiveGame, setTeamsWithLiveGame] = useState({});

  //this is the useeffect for the count of the live game
  useEffect(() => {
    const fetchTeamRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "liveGames"));
        let liveGameCount = 0;
        const liveTeamsMap = {};
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const { teamNames, score, gameState } = data;
  
          if (!teamNames || !score) return;
  
          if (gameState === false) {
            // Game is live
            liveTeamsMap[teamNames.home] = true;
            liveTeamsMap[teamNames.away] = true;
          }
  
          if (gameState === true) {
            // Finished game
            liveGameCount += 1;
          }
        });
  
        setliveCount(liveGameCount);
        setTeamsWithLiveGame(liveTeamsMap); // ✅ store which teams have live games
      } catch (error) {
        console.error("Error fetching team records:", error);
      }
    };
  
    fetchTeamRecords();
  }, []);
  
  
  useEffect(() => {
    const fetchTeamRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "liveGames"));
        const recordMap = {}; // { teamName: { wins: 0, losses: 0 } }
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
  
          const { teamNames, score, gameState } = data;
  
          if (!gameState || !teamNames || !score) return;
  
          const { home: homeScore, away: awayScore } = score;
          const { home, away } = teamNames;
  
          if (
            homeScore === undefined ||
            awayScore === undefined ||
            !home ||
            !away
          ) {
            return;
          }
  
          // Initialize if not present
          if (!recordMap[home]) recordMap[home] = { wins: 0, losses: 0 };
          if (!recordMap[away]) recordMap[away] = { wins: 0, losses: 0 };
  
          if (homeScore > awayScore) {
            recordMap[home].wins += 1;
            recordMap[away].losses += 1;
          } else if (awayScore > homeScore) {
            recordMap[away].wins += 1;
            recordMap[home].losses += 1;
          }
        });
  
        setTeamRecords(recordMap);
      } catch (error) {
        console.error("Error fetching team records:", error);
      }
    };
  
    fetchTeamRecords();
  }, []);
  
  useEffect(() => {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    const closeMenu = document.getElementById("close-menu");
    if (!hamburger || !mobileMenu || !closeMenu) return;

    const openMenu = () => {
      mobileMenu.classList.remove("hidden");
      setTimeout(() => {
        mobileMenu.classList.remove("-translate-x-full");
      }, 10);
    };

    const closeMenuFn = () => {
      mobileMenu.classList.add("-translate-x-full");
      setTimeout(() => {
        mobileMenu.classList.add("hidden");
      }, 300);
    };

    hamburger.addEventListener("click", openMenu);
    closeMenu.addEventListener("click", closeMenuFn);
    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) {
        closeMenuFn();
      }
    });

    return () => {
      hamburger.removeEventListener("click", openMenu);
      closeMenu.removeEventListener("click", closeMenuFn);
      mobileMenu.removeEventListener("click", closeMenuFn);
    };
  }, []);
  useEffect(() => {
    const fetchTeamGameCounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "liveGames"));
        const counts = {};
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const teamNames = data.teamNames || {};
  
          const homeTeam = teamNames.home;
          const awayTeam = teamNames.away;
  
          if (homeTeam) {
            counts[homeTeam] = (counts[homeTeam] || 0) + 1;
          }
  
          if (awayTeam) {
            counts[awayTeam] = (counts[awayTeam] || 0) + 1;
          }
        });
  
        setTeamGameCounts(counts);
      } catch (error) {
        console.error("Error fetching live games:", error);
      }
    };
  
    fetchTeamGameCounts();
  }, []);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Teams"));
        const teamList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBasketballTeams(teamList); // ✅ fix: correct setter
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <body style={{ scrollBehavior: "smooth" }}>
      <div style={{ scrollBehavior: "smooth", height: "100vh", overflowY: "scroll" }}>
        <header className="bg-primary-bg absolute bg-opacity-60 shadow w-full px-2 z-50">
          <div className="container mx-auto">
            <div className="flex cursor-pointer justify-between items-center py-4  mx-auto">
              <a
                onClick={() => {
                  navigate("/");
                }}
                className="text-xl font-bold text-white"
              >
                StatsPro <span className="text-sm text-gray-400">| Basketball</span>
              </a>

              <nav className="hidden md:flex space-x-6 text-gray-300 text-sm">
                <a onClick={() => navigate("/")} className="hover:text-white">
                  Home
                </a>
                <a onClick={()=>{navigate('/liveGameHomeDashboard')}} className="hover:text-white ">
                  LiveGames
                </a>
                <a className="hover:text-white border-b-2 border-b-primary-cta pb-1">
                  Teams
                </a>
              </nav>

              <button id="hamburger" className="text-white md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9h16.5m-16.5 6.75h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div
          id="mobile-menu"
          className="fixed inset-0 bg-primary-bg bg-opacity-98 md:hidden hidden z-50 transition-transform duration-300 transform -translate-x-full"
        >
          <div className="flex flex-col justify-between h-full p-6 text-white">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">StatsPro</h2>
              <button id="close-menu" className="text-2xl text-gray-300 hover:text-white">
                ✕
              </button>
            </div>
            <nav className="space-y-6 text-lg">
              <a onClick={() => navigate("/")} className="block hover:text-blue-400">
                Home
              </a>
              <a
                onClick={()=>{navigate('/liveGameHomeDashboard')}}
                className="block hover:text-blue-400 text-white  "
              >
                LiveGames
              </a>
              <a
                href="#"
                className="block hover:text-blue-400 text-white border-l-2 border-l-primary-cta pl-4 "
              >
                Teams
              </a>
            </nav>
            <div>
              <div className="block text-center text-blue-500 font-semibold text-gray-400 py-3 rounded-lg">
                StatsPro | Basketball
                <br />
                Beta
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with Parallax */}
        <section className="relative h-[75vh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.ctfassets.net/wn7ipiv9ue5v/31AjwLcN8AX6OUm5af8Fg5/04a480caf4b1e93be9a1028cab97841e/N25-BASE-STANDARD_EDITION_ANNOUNCE-NA-STATIC-ESRB-AGN-3840x2160__1___1_v2.jpg')`,
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          />
           <div className="absolute inset-0 bg-black bg-opacity-60 md:hidden block" />
          
          <div className="absolute inset-0 bg-gradient-to-r from-primary-bg/90 via-primary-bg/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-bg via-transparent to-transparent" />

          <div className="relative z-10 mt-10 md:mt-0 flex items-center h-full max-w-7xl mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white">
                Irish Hoops
              </h1>
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center space-x-1">
                  {/* <span className="text-lg">24/25 Season</span> */}
                </div>
                { liveCount &&
                <span className="px-2 py-1 bg-primary-red text-sm rounded">{liveCount} Game{liveCount>1 ? "s" : ""} Live ⚪️</span>
                }
              </div>
              <p className="mb-5 md:text-gray-300 text-white text-lg">Discover local basketball teams from every corner of Ireland. Whether you're a fan, a player, or just curious, explore the stories, rivalries, and live action happening across the country.</p>
              <div className="flex space-x-4">
                <a
                href="#teams"
                  className="bg-white text-black hover:bg-gray-200 md:px-8 px-4 py-3 text-lg font-semibold rounded-md transition-colors flex items-center"
                >
                  View Teams
                </a>
                <button onClick={()=>{
                    navigate('/liveGameHomeDashboard')
                }} className="border border-gray-400 text-white hover:bg-white/10 px-8 py-3 text-lg bg-transparent rounded-md transition-colors flex items-center">
                {/* <Info className="w-5 h-5 mr-2" /> */}
                Back to Home
              </button>
              </div>
            </div>
          </div>
        </section>

<section className="relative z-20 bg-primary-bg py-16">
        <div id="teams"  className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-white">Featured Teams</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {basketballTeams.map((team) => (
              <div
              onClick={()=>{
                navigate(`/teams/${encodeURIComponent(team.Name)}`);
              }}
                key={team.id}
                className="bg-gradient-to-br relative from-card-bg bg-opacity-30 to-secondary-bg rounded-xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-primary-cta/20 transition-all duration-300 cursor-pointer group border border-gray-700/50"
              >
                                 {teamsWithLiveGame[team.Name] && (
      <span className="bg-red-500 absolute right-2 top-2 text-white text-xs font-bold  px-2 py-1 rounded-full">
     LIVE <span className="animate-pulse">⚪️</span>  
      </span>
    )}
                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={team.Image || "/placeholder.svg?height=80&width=80"}
                      alt={team.Name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>

                {/* Team Info */}
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary-cta transition-colors duration-300">
                    {team.Name}
   
                  </h3>

                  {/* Stats Row */}
                  <div className="flex items-center justify-center space-x-5 md:mx-10 mx-auto      pt-4 border-t border-gray-700/50">
                    {/* <div className="text-center ">
                    <div className="text-lg font-bold text-primary-green">
  {teamRecords[team.Name]?.wins ?? 0}-{teamRecords[team.Name]?.losses ?? 0}
</div>

                      <div className="text-xs text-gray-500">Form</div>
                    </div> */}

                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-cta">{teamGameCounts[team.Name] || '0'}</div>
                      <div className="text-xs text-gray-500">Games</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-cta">{teamGameCounts[team.Name] || '0'}</div>
                      <div className="text-xs text-gray-500">Season</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-4 bg-primary-cta hover:bg-primary-cta/80 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                    View Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Teams Section */}
        {/* <section className="relative z-20 bg-primary-bg py-16" id="teams">
          <div className="p-4 max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-bold mb-4 text-white">Teams</h2>
            {basketballTeams.length === 0 ? (
              <p className="text-white">No teams found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {basketballTeams.map((team) => (
                  <div key={team.id} className="bg-white p-4 rounded shadow">
                    <img
                      src={team.Image || "/placeholder.svg"}
                      alt={team.Name}
                      className="w-full h-40 object-cover mb-2"
                    />
                    <h3 className="text-lg font-semibold">{team.Name}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section> */}
      </div>
    </body>
  );
}
