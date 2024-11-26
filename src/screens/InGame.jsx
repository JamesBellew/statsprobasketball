export default function InGame(){
    const actions = [
        "2 Points",
        "3 Points",
        "Free Throw",
        "Free Throw Miss",
        "2Pt Miss",
        "3Pt Miss",
        "T/O",
        "Block",

      ];
    return(
        <>
        {/* Top Nav */}
        <div className="container mx-auto bg-gradient-to-b  items-center  from-black to-gray-900">
   <div className="top-nav w-full  h-[15vh]">
   </div>
   

   {/* Pitch Component */}
   <div className="top-nav w-full relative bg-gray-800 h-[55vh]">
    {/* court lines */}
    <div className="absolute w-[88%]  h-[70%] rounded-b-full left-[6%] bg-gray-800  border-gray-500 border-2"></div>
    <div className="absolute w-1/3 left-1/3 border-2 border-gray-500 h-[40%] "></div>
    <div className="absolute w-1/3 left-1/3 border-2 border-gray-500 h-[20%] rounded-b-full top-[40%] "></div>
   </div>


   {/* Bottom Nav */}
   <div className="bottom-nav  flex items-center justify-center  w-full h-[30vh]">

      <div className="grid grid-cols-4 w-full  my-auto gap-1 lg:grid-cols-6">
        {actions.map((label, index) => (
          <button
            key={index}
            className="bg-gray-800 text-white font-semibold py-3 px-4 h-20 rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105 focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            {label}
          </button>
        ))}
      </div>

   </div>
   </div>
        </>
    )
}