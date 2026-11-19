import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";

const thisYear = new Date().getFullYear();
const years = Array.from({ length: 26 }, (_, i) => thisYear + 1 - i);

const inputClass =
  "w-full rounded bg-gray-700 p-2 text-base text-white outline-none focus:ring-2 focus:ring-blue-500";

const empty = {
  name: "",
  class_name: "",
  batch: "",
  gender: "",
  marks_obtained: "",
  total_marks: "100",
};

const AddStudent = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileKey, setFileKey] = useState(0); // file input reset karne ke liye
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // purani preview URL ko free karke preview hatao
  const clearPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      clearPhoto();
      return setErrors((p) => ({ ...p, photo: "Choose an image file." }));
    }
    if (file.size > 2 * 1024 * 1024) {
      clearPhoto();
      return setErrors((p) => ({ ...p, photo: "Photo must be under 2 MB." }));
    }

    setErrors((p) => ({ ...p, photo: "" }));
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const obtained = Number(form.marks_obtained);
  const total = Number(form.total_marks);
  const percentage =
    form.marks_obtained !== "" && total > 0 && obtained <= total
      ? ((obtained / total) * 100).toFixed(1)
      : null;

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter the student's name.";
    if (!form.class_name.trim()) next.class_name = "Enter the class.";
    if (!form.batch) next.batch = "Select the batch year.";
    if (!form.gender) next.gender = "Select the gender.";
    if (!photo) next.photo = "Upload the student's photo.";
    if (!(total > 0)) next.total_marks = "Total marks must be above 0.";
    if (form.marks_obtained === "" || obtained < 0)
      next.marks_obtained = "Enter valid marks.";
    else if (total > 0 && obtained > total)
      next.marks_obtained = "Marks can't be more than total marks.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    const body = new FormData();
    Object.entries(form).forEach(([k, val]) => body.append(k, val));
    body.append("photo", photo);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/students", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body, // Content-Type mat lagao, browser FormData ke liye khud lagata hai
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not add student.");

      // form reset
      setForm(empty);
      clearPhoto();
      setFileKey((k) => k + 1); // file input ka purana naam hat jayega
      setSuccess("Student added successfully.");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const err = (key) =>
    errors[key] && <p className="mt-1 text-sm text-red-400">{errors[key]}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar: md se upar hamesha dikhega, phone par menu se khulega */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className={`${menuOpen ? "block" : "hidden"} z-40 md:block`}>
        <SideBar />
      </div>

      {/* Main area: sidebar ki width (w-60) ke barabar margin */}
      <div className="min-w-0 md:ml-60">
        {/* Top bar, sirf phone par */}
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-gray-800 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded p-1 text-2xl leading-none hover:bg-gray-700"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <span className="font-semibold">Add Student</span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="mb-6 text-center text-xl font-bold text-white underline decoration-blue-500 decoration-2 underline-offset-4 sm:text-2xl">
            Add Student
          </h2>

          {serverError && (
            <div className="mx-auto mb-4 max-w-xl rounded bg-red-900/40 p-3 text-red-300">
              {serverError}
            </div>
          )}

          {success && (
            <div className="mx-auto mb-4 max-w-xl rounded bg-green-900/40 p-3 text-green-300">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto w-full max-w-xl space-y-4 rounded-lg bg-gray-800/50 p-4 sm:p-6"
          >
            {/* Photo */}
            <div>
              <label htmlFor="photo" className="mb-1 block">Photo</label>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-20 w-20 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs text-gray-400">
                    No photo
                  </div>
                )}
                <input
                  key={fileKey}
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="w-full min-w-0 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
                />
              </div>
              {err("photo")}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1 block">Name</label>
              <input id="name" name="name" type="text" placeholder="Enter student's name"
                autoComplete="name" value={form.name} onChange={handleChange} className={inputClass} />
              {err("name")}
            </div>

            {/* Class */}
            <div>
              <label htmlFor="class_name" className="mb-1 block">Class</label>
              <input id="class_name" name="class_name" type="text" placeholder="e.g. MCA 1st year"
                autoComplete="off" value={form.class_name} onChange={handleChange} className={inputClass} />
              {err("class_name")}
            </div>

            {/* Batch + Gender */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="batch" className="mb-1 block">Batch (year)</label>
                <select id="batch" name="batch" value={form.batch} onChange={handleChange} className={inputClass}>
                  <option value="">Select batch year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {err("batch")}
              </div>

              <div>
                <label htmlFor="gender" className="mb-1 block">Gender</label>
                <select id="gender" name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
                {err("gender")}
              </div>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="marks_obtained" className="mb-1 block">Marks obtained</label>
                <input id="marks_obtained" name="marks_obtained" type="number" min="0"
                  inputMode="numeric" value={form.marks_obtained} onChange={handleChange} className={inputClass} />
                {err("marks_obtained")}
              </div>
              <div>
                <label htmlFor="total_marks" className="mb-1 block">Total marks</label>
                <input id="total_marks" name="total_marks" type="number" min="1"
                  inputMode="numeric" value={form.total_marks} onChange={handleChange} className={inputClass} />
                {err("total_marks")}
              </div>
            </div>

            {percentage !== null && (
              <p className="text-sm text-gray-300">
                Percentage: <strong className="text-white">{percentage}%</strong>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2"
            >
              {loading ? "Saving..." : "Add student"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;