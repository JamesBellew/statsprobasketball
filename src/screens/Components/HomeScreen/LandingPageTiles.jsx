import { useNavigate } from "react-router-dom";

export default function LandingPageTiles({ showLoginModal, setShowLoginModal }) {
  const navigate = useNavigate(); // Initialize the navigation hook

  const liveGamesNavigationHandler=()=>{
    navigate('liveGameHomeDashboard')
  }
return(
    <>
    <div class="container px-2  mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">


{/* <div class="relative w-full bg-red-500 group overflow-hidden rounded-lg lg:col-span-4"> */}
<a onClick={()=>{navigate('liveGameHomeDashboard')}} class="relative group overflow-hidden flex-auto rounded-lg col-span-2 lg:col-span-4 hover:scale-[98%] duration-700 cursor-pointer">
  <img src="https://images.ctfassets.net/wn7ipiv9ue5v/31AjwLcN8AX6OUm5af8Fg5/04a480caf4b1e93be9a1028cab97841e/N25-BASE-STANDARD_EDITION_ANNOUNCE-NA-STATIC-ESRB-AGN-3840x2160__1___1_v2.jpg" class="w-full   h-96 object-cover transition duration-300 group-hover:brightness-110" alt="BMW iX" />
  <p className="absolute right-5 top-5 text-white capitalize">alpha 2.29🔥</p>
  <div class="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition duration-300"></div>
  <div class="absolute bottom-4 left-4 text-white">

    <h2 class="text-3xl font-bold leading-tight">Watch Local Hoops<br/>Live & In Real-Time.</h2>
    <button onClick={liveGamesNavigationHandler} class="mt-4 px-4 py-2 border-2 border-white hover:bg-white hover:text-black transition rounded">Show Live Games</button>
  </div>
</a>


<a onClick={()=>{navigate('/teamsDashboard')}} class="relative group overflow-hidden flex-auto rounded-lg col-span-2 hover:scale-[98%] duration-700 cursor-pointer">
  <img src="https://wallpapers.com/images/hd/remarkable-image-of-michael-jordan-hd-nmipcpac1i48bkj5.jpg" class="w-full h-72 object-cover transition duration-300 group-hover:brightness-110" alt="BMW car" />
  <div class="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-20 transition duration-300"></div>
  <div class="absolute bottom-4 left-4 text-white">
    <h2 class="text-2xl font-bold leading-tight capitalize">Follow Local Teams<br/>View previous games, stats & more!</h2>
    <button onClick={()=>{navigate('/teamsDashboard')}} class="mt-4 px-4 py-2 border-2 border-white hover:bg-white hover:text-black transition rounded">View Teams</button>
  </div>
</a>


<div class="relative group overflow-hidden flex-auto rounded-lg col-span-2" >
  <img src="https://media.bleacherreport.com/image/upload/v1724179684/qb2sksfcr3c5zhewcp0d.jpg" class="w-full h-72 object-cover transition duration-300 group-hover:brightness-110" alt="BMW luxury" />
  <div class="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-20 transition duration-300"></div>
  <div class="absolute bottom-4 left-4 text-white">
    <h2 class="text-2xl font-bold leading-tight">View Player Stats<br/>In Dept Player Stats, %'s & More!</h2>
    <button class="mt-4 px-4 py-2 border-2 border-white hover:bg-white hover:text-black transition rounded">Coming Soon Release 3.0</button>
  </div>
</div>

</div>
    </>
)

}