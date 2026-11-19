import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;
const JWT_SECRET = "change-this-to-a-long-random-string"; // baad me .env me daalna

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir)); // photo /uploads/<filename> par khulti hai

// MongoDB connect
mongoose
  .connect("mongodb://127.0.0.1:27017/StudentManagement")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection failed:", err.message));

/* ---------------- Schemas ---------------- */

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true }, // hashed save hota hai
  },
  { timestamps: true }
);

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    class_name: { type: String, required: true, trim: true },
    batch: { type: Number, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Transgender"] },
    marks_obtained: { type: Number, required: true, min: 0 },
    total_marks: { type: Number, required: true, min: 1 },
    percentage: { type: Number },
    photo: { type: String }, // /uploads me save hui file ka naam
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Student = mongoose.model("Student", StudentSchema);

/* ---------------- Helpers ---------------- */

// Photo upload: sirf image, max 2 MB
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) =>
      cb(null, Date.now() + "-" + Math.round(Math.random() * 1e6) + path.extname(file.originalname)),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only image files are allowed.")),
});

// upload hui file delete karna
const removeFile = (file) => {
  if (file) fs.unlink(file.path, () => {});
};

// student ka data check karta hai (add aur edit dono me use hota hai)
// problem mile to message return karta hai, sab sahi ho to "" return karta hai
const checkStudent = (body) => {
  const { name, class_name, batch, gender, marks_obtained, total_marks } = body;
  const obtained = Number(marks_obtained);
  const total = Number(total_marks);

  if (!name?.trim() || !class_name?.trim()) return "Name and class are required.";
  if (!batch || Number.isNaN(Number(batch))) return "Select the batch year.";
  if (!["Male", "Female", "Transgender"].includes(gender)) return "Select the gender.";
  if (!(total > 0)) return "Total marks must be above 0.";
  if (marks_obtained === "" || Number.isNaN(obtained) || obtained < 0) return "Enter valid marks.";
  if (obtained > total) return "Marks can't be more than total marks.";
  return "";
};

// token check: Authorization: Bearer <token>
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Please log in." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Log in again." });
  }
};

/* ---------------- Auth routes ---------------- */

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password)
    return res.status(400).json({ message: "All fields are required." });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "This email is already registered." });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, phone, password: hashed });

    res.status(201).json({ message: "Account created. You can log in now." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Try again." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password)
      return res.status(400).json({ message: "Enter your email and password." });

    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Try again." });
  }
});

/* ---------------- Student routes (login zaroori) ---------------- */

// 1) Student add
app.post("/api/admin/students", auth, upload.single("photo"), async (req, res) => {
  try {
    const { name, class_name, batch, gender, marks_obtained, total_marks } = req.body;

    let problem = checkStudent(req.body);
    if (!problem && !req.file) problem = "Upload the student's photo.";

    if (problem) {
      removeFile(req.file);
      return res.status(400).json({ message: problem });
    }

    const obtained = Number(marks_obtained);
    const total = Number(total_marks);

    const student = await Student.create({
      name,
      class_name,
      batch: Number(batch),
      gender,
      marks_obtained: obtained,
      total_marks: total,
      percentage: Number(((obtained / total) * 100).toFixed(1)),
      photo: req.file.filename,
    });

    res.status(201).json(student);
  } catch (error) {
    console.log(error);
    removeFile(req.file);
    res.status(500).json({ message: "Could not add student." });
  }
});

// 2) Saare students, ya search (?search=ravi)
app.get("/api/admin/students", auth, async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    // search khali hai to saare students bhejo
    if (!search) {
      const allStudents = await Student.find().sort({ createdAt: -1 });
      return res.json(allStudents);
    }

    // special characters ko safe karo, warna regex error deta hai
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // name ya class me search (capital/small ka farak nahi)
    const conditions = [
      { name: { $regex: safe, $options: "i" } },
      { class_name: { $regex: safe, $options: "i" } },
    ];

    // batch number hai, isliye sirf tab search karo jab user number likhe
    if (!isNaN(search)) {
      conditions.push({ batch: Number(search) });
    }

    const students = await Student.find({ $or: conditions }).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch students." });
  }
});

// 3) Ek student ka data (edit form me purana data bharne ke liye)
app.get("/api/admin/students/:id", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch student." });
  }
});

// 4) Student update (photo optional hai)
app.put("/api/admin/students/:id", auth, upload.single("photo"), async (req, res) => {
  try {
    const { name, class_name, batch, gender, marks_obtained, total_marks } = req.body;

    const problem = checkStudent(req.body);
    if (problem) {
      removeFile(req.file);
      return res.status(400).json({ message: problem });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      removeFile(req.file);
      return res.status(404).json({ message: "Student not found." });
    }

    const obtained = Number(marks_obtained);
    const total = Number(total_marks);

    student.name = name;
    student.class_name = class_name;
    student.batch = Number(batch);
    student.gender = gender;
    student.marks_obtained = obtained;
    student.total_marks = total;
    student.percentage = Number(((obtained / total) * 100).toFixed(1));

    // nayi photo aayi to purani file delete karo
    if (req.file) {
      const oldPhoto = student.photo;
      student.photo = req.file.filename;
      if (oldPhoto) fs.unlink(path.join(uploadDir, oldPhoto), () => {});
    }

    await student.save();
    res.json(student);
  } catch (error) {
    console.log(error);
    removeFile(req.file);
    res.status(500).json({ message: "Could not update student." });
  }
});

// 5) Student delete (photo file bhi delete hogi)
app.delete("/api/admin/students/:id", auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });

    if (student.photo) fs.unlink(path.join(uploadDir, student.photo), () => {});

    res.json({ message: "Student deleted." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not delete student." });
  }
});

// Multer ke errors (file badi hai, image nahi hai) ka message frontend ko bhejta hai
// Ye sabse neeche hi rehna chahiye
app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));