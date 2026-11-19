import { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const Sign = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";

    if (!form.email.trim()) next.email = "Enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "Enter a valid email address.";

    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    else if (!/^[6-9]\d{9}$/.test(form.phone))
      next.phone = "Enter a valid 10-digit mobile number.";

    if (!form.password) next.password = "Enter a password.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed.");

      // success: go to the login page and show the message there
      navigate("/", { state: { message: data.message } });
    } catch (err) {
      setServerError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <h1>Sign up</h1>
        <p className="subtitle">Create a new account</p>

        {serverError && <div className="server-error">{serverError}</div>}

        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "invalid" : ""}
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "invalid" : ""}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            className={errors.phone ? "invalid" : ""}
          />
          {errors.phone && <div className="error">{errors.phone}</div>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "invalid" : ""}
            />
            <button
              type="button"
              className="toggle"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        <button type="submit" className="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="switch-text">
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Sign;