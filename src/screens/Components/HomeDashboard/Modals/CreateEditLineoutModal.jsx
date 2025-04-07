import React from "react";

const CreateEditLineoutModal = ({
  showLineoutModal,
  setShowLineoutModal,
  lineoutName,
  setLineoutName,
  players,
  addPlayer,
  removePlayer,
  handlePlayerChange,
  handleSaveLineout,
  handleImageUpload,
  addPhotos,
  setAddPhotos,
  formError,
  creatingLineout,
  editingLineoutId,
}) => {
  if (!showLineoutModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-secondary-bg rounded-lg shadow-lg w-auto p-6">
        <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-secondary-bg   rounded-lg shadow-lg w-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingLineoutId ? "Edit Lineout" : "Create Lineout"}
            </h2>

            {/* ✅ Checkbox to Toggle Image Uploads */}
            <div className="flex items-center mb-4">
              {/* <input
                type="checkbox"
                id="addPhotos"
                checked={addPhotos}
                onChange={() => setAddPhotos(!addPhotos)}
                className="mr-2"
              /> */}


<label class="inline-flex items-center cursor-pointer">
  <input    id="addPhotos" type="checkbox" value=""                checked={addPhotos}
                onChange={() => setAddPhotos(!addPhotos)} class="sr-only peer"/>
  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
  <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Add Player Images</span>
</label>


              {/* <label htmlFor="addPhotos" className="text-sm text-gray-300">
                Add Player Photos
              </label> */}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Lineout Name
                </label>
                <input
                  type="text"
                  value={lineoutName}
                  onChange={(e) => setLineoutName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter lineout name"
                />
              </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Players</h3>
              {players.map((player, index) => (
                <div key={index} className="flex flex-row gap-2 mb-3 items-center">
                  
                  {/* ✅ Player Name Input */}
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                    className="w-3/5 px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Player ${index + 1} Name`}
                  />

                  {/* ✅ Player Number Input */}
                  <input
                    type="number"
                    value={player.number}
                    onChange={(e) => handlePlayerChange(index, "number", e.target.value)}
                    className="w-1/5 px-3 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Number"
                  />

                  {/* ✅ Conditional Image Upload */}
                  {addPhotos && (
                    <>
                    <div className={`w-1/5 flex flex-col items-center rounded-md
                      ${player.image ? "bg-primary-bg" : ""}
                      
                      `}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        className="hidden"
                        id={`file-upload-${index}`}
                      />
                      <label
                        htmlFor={`file-upload-${index}`}
                        className="w-full text-center px-3 py-2 bg-white/10 rounded cursor-pointer hover:bg-gray-600"
                      >
                        {player.image ? "Delete" : "Upload"}
                      </label>

                     
                    </div>
                    <div className="w-1/5  h-full">
                     {/* ✅ Show Image Preview */}
                     {player.image && (
                        <img
                          src={player.image}
                          alt={`Player ${index + 1}`}
                          className="w-12 mx-auto h-12 rounded-full mt-2"
                        />
                      )}</div>
                    </>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={addPlayer}
                  disabled={players.length >= 15}
                  className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded disabled:opacity-50"
                >
                  +
                </button>
                <button
                  onClick={removePlayer}
                  disabled={players.length <= 5}
                  className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded disabled:opacity-50"
                >
                  –
                </button>
              </div>
            </div>

            {formError && <p className="mt-3 text-red-400 text-sm">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLineoutModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
  onClick={handleSaveLineout}
  className={`px-4 py-2 rounded ${
    creatingLineout
      ? "bg-blue-700 cursor-not-allowed"
      : "bg-indigo-600 hover:bg-primary-cta"
  }`}
  disabled={creatingLineout}
>
  {creatingLineout ? (
    <span className="flex items-center gap-2">
      <svg
        className="animate-spin h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
      Creating...
    </span>
  ) : (
    "Save Lineout"
  )}
</button>

            </div>
          </div>
        </div>
      </>
        </div>
      </div>
    </>
  );
};

export default CreateEditLineoutModal;
