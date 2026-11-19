// React ke hooks: useState = data yaad rakhne ke liye, useEffect = page khulne par kuch chalane ke liye
import { useEffect, useState } from "react";
// Left side wala menu (sidebar) component
import SideBar from "./SideBar";
// useNavigate = code se dusre page par jaane ke liye
import { useNavigate } from "react-router-dom";
// axios = backend se data maangne (GET, DELETE) ke liye
import axios from "axios";
// Edit (pencil) aur Delete (dustbin) ke icons
import { FaEdit, FaTrash } from "react-icons/fa";

// Backend ka address. Baar baar likhna na pade isliye ek jagah rakha
const API = "http://localhost:5000";

const Managestudents = () => {
  // Students = database se aaye saare students ki list (shuru me khali)
  const [Students, SetStudents] = useState([]);
  // SearchTerm = search box me jo likha hai wo text
  const [SearchTerm, SetsearchTerm] = useState("");
  // loading = true hai to "Loading..." dikhega
  const [loading, setLoading] = useState(false);
  // menuOpen = phone par sidebar khula hai ya band
  const [menuOpen, setMenuOpen] = useState(false);
  // navigate("/path") se page badal sakte hain
  const navigate = useNavigate();

  // Har request ke saath login token bhejna padta hai, ye function wahi header banata hai
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Agar token expire ho gaya (backend ne 401 bheja) to login page par bhej do
  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      // purana token aur user data hata do
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // login page par bhejo (replace = back dabane par wapas na aaye)
      navigate("/", { replace: true });
      return true; // matlab: ye auth error tha aur handle ho gaya
    }
    return false; // matlab: ye koi aur error hai
  };

  // Ye page pehli baar khulne par chalta hai, aur jab bhi SearchTerm badalta hai
  useEffect(() => {
    // 400ms ruko, phir data mangao (har akshar likhne par API call na ho)
    const timer = setTimeout(() => {
      FetchStudentData();
    }, 400);

    // Agar user 400ms ke andar aur type kare, to purana timer cancel kar do
    return () => clearTimeout(timer);
  }, [SearchTerm]); // [SearchTerm] = jab SearchTerm badle tabhi dobara chalao

  // Backend se students ki list laane wala function
  const FetchStudentData = async () => {
    try {
      setLoading(true); // "Loading..." dikhao
      // GET request: /api/admin/students?search=<text>
      const res = await axios.get(`${API}/api/admin/students`, {
        params: { search: SearchTerm }, // search text URL me chala jata hai
        headers: authHeader(), // token bhejo, warna backend mana kar dega
      });
      SetStudents(res.data); // aaya hua data state me daal do, table apne aap update hogi
    } catch (error) {
      // auth error nahi hai to console me error dikhao
      if (!handleAuthError(error)) console.log(error);
    } finally {
      setLoading(false); // success ho ya error, "Loading..." band karo
    }
  };

  // Student delete karne wala function (id = jis student ko delete karna hai)
  const deleteStudent = async (id) => {
    // Pehle user se poocho. Cancel dabaya to yahin ruk jao
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      // DELETE request: /api/admin/students/<id>
      await axios.delete(`${API}/api/admin/students/${id}`, {
        headers: authHeader(),
      });
      FetchStudentData(); // delete ke baad list dobara mangao taaki table update ho
    } catch (error) {
      if (!handleAuthError(error)) alert("Could not delete student.");
    }
  };

  return (
    // Poora page: dark background, white text
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Phone par menu khula ho to piche dark parda dikhao. Us par click karo to menu band */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {/* Sidebar: phone par sirf menuOpen true ho tab dikhega, bade screen (md) par hamesha dikhega */}
      <div className={`${menuOpen ? "block" : "hidden"} z-40 md:block`}>
        <SideBar />
      </div>

      {/* Main content: bade screen par left me 60 jagah chhodo (sidebar ki width w-60 hai) */}
      <div className="min-w-0 md:ml-60">
        {/* Upar ki bar, sirf phone par dikhti hai (md:hidden) */}
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-gray-800 px-4 py-3 md:hidden">
          {/* Hamburger button: dabane par menu khulta/band hota hai */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)} // true <-> false badalta hai
            aria-label="Toggle menu"
            className="rounded p-1 text-2xl leading-none hover:bg-gray-700"
          >
            {/* menu khula hai to ✕, band hai to ☰ */}
            {menuOpen ? "✕" : "☰"}
          </button>
          <span className="font-semibold">Manage Students</span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page ka heading */}
          <h2 className="mb-6 text-center text-xl font-bold text-white underline decoration-blue-500 decoration-2 underline-offset-4 sm:text-2xl">
            Manage Students
          </h2>

          {/* Search box wala hissa */}
          <div>
            <label htmlFor="search" className="mb-1 block">Search students</label>
            <input
              id="search"
              type="text"
              value={SearchTerm} // box me wahi dikhta hai jo state me hai
              onChange={(e) => SetsearchTerm(e.target.value)} // har akshar par state update, phir useEffect chalta hai
              placeholder="Search Students By their Name, Class, Batch Year"
              className="w-full rounded bg-gray-700 p-2 text-base text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Chhoti screen par table side me scroll ho sake isliye overflow-x-auto */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full">
              {/* Table ki header row (column ke naam) */}
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="p-2">Photo</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Batch</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* 3 situations: 1) loading, 2) koi student nahi, 3) students dikhao */}
                {loading ? (
                  // 1) Data aa raha hai. colSpan=5 = 5 columns ki poori chaudai
                  <tr>
                    <td colSpan="5" className="p-4 text-center">Loading...</td>
                  </tr>
                ) : Students.length === 0 ? (
                  // 2) List khali hai (search se kuch nahi mila)
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-400">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  // 3) Har student ke liye ek row banao (map = list ke har item par chalta hai)
                  // s = ek student, key = React ko har row alag pehchanne ke liye
                  Students.map((s) => (
                    <tr key={s._id} className="border-b border-gray-800">
                      <td className="p-2">
                        {/* Photo backend ke /uploads folder se aati hai */}
                        <img
                          src={`${API}/uploads/${s.photo}`}
                          alt={s.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.class_name}</td>
                      <td className="p-2">{s.batch}</td>
                      <td className="p-2">
                        {/* Edit button: AddStudent page kholta hai, URL me student ki id ke saath */}
                        <button
                          className="text-yellow-500"
                          onClick={() => navigate(`/addstudent?id=${s._id}`)}
                          aria-label="Edit"
                        >
                          <FaEdit />
                        </button>
                        {/* Delete button: is student ki id deleteStudent ko bhejta hai */}
                        <button
                          className="ml-4 text-red-500"
                          onClick={() => deleteStudent(s._id)}
                          aria-label="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Isse App.jsx me import karke use kar sakte hain
export default Managestudents;