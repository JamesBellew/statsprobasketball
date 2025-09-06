import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, firestore } from "../firebase";

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserType, setNewUserType] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true); // ✅ new state
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
  // ✅ Check if current user is admin
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate("/homedashboard", { state: { message: "unauth" } });
          return;
        }

        const userDocRef = doc(firestore, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || userDoc.data().userType !== "admin") {
          navigate("/homedashboard", { state: { message: "unauth" } });
          return;
        }
      } catch (err) {
        console.error("Error checking user access:", err);
        navigate("/homedashboard", { state: { message: "unauth" } });
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [navigate]);

  // ✅ Fetch users (only if admin check passes)
  useEffect(() => {
    if (checkingAccess) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const userData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [checkingAccess]);

  const addUser = async () => {
    if (!newUserEmail) return;
    try {
      const docRef = await addDoc(collection(firestore, "users"), {
        email: newUserEmail,
        userType: newUserType,
      });
      setUsers([
        ...users,
        { id: docRef.id, email: newUserEmail, userType: newUserType },
      ]);
      setNewUserEmail("");
      setNewUserType("viewer");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteDoc(doc(firestore, "users", deleteUserId));
      setUsers(users.filter((user) => user.id !== deleteUserId));
      setDeleteUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Checking access...</span>
      </div>
    );
  }

  return (
    <>
        <header className="bg-primary-bg relative bg-opacity-60 shadow w-full px-2 z-50">
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
      <div className="p-6 min-h-screen h-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

        {/* Add User Section */}
        <div className="mb-6 text-white flex gap-2">
          <input
            type="email"
            placeholder="Enter user email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="p-2 rounded text-white w-64"
          />
          <select
            value={newUserType}
            onChange={(e) => setNewUserType(e.target.value)}
            className="p-2 rounded"
          >
            <option value="coach">Coach</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={addUser}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add User
          </button>
        </div>

        {/* ✅ Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="hidden md:table min-w-full border rounded-md border-gray-600">
              <thead className="text-left bg-white/20 text-black">
                <tr>
                  <th className="border-b-2 px-4 border-b-gray-600 py-2">
                    Email
                  </th>
                  <th className="border-b-2 px-4 border-b-gray-600 py-2">
                    User Type
                  </th>
                  <th className="border-b-2 px-4 border-b-gray-600 py-2">
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border-b-2 text-left px-4 border-b-gray-600 py-2">
                      {user.email}
                    </td>
                    <td className="border-b-2 text-left px-4 border-b-gray-600 py-2">
                      {user.userType}
                    </td>
                    <td className="border-b-2 text-left px-4 border-b-gray-600 py-2 space-x-2">
                      <button
                        onClick={() => setDeleteUserId(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                      {/* <button
                        onClick={() => setDeleteUserId(user.id)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-600 rounded-md p-4 shadow-sm bg-gray-800 text-white"
                >
                  <p className="mb-2">
                    <span className="font-semibold">Email: </span>
                    {user.email}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">User Type: </span>
                    {user.userType}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => setDeleteUserId(user.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                    {/* <button
                      onClick={() => setDeleteUserId(user.id)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Delete Confirmation Modal */}
        {deleteUserId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-secondary-bg rounded-md p-6 shadow-md">
              <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
              <p className="mb-4">
                This action will delete the user permanently.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteUserId(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
