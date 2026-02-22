import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>
          Join the Secure Digital Signature Platform
        </p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            placeholder="Enter your email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            placeholder="Create a password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button style={styles.button} onClick={handleRegister}>
          Register
        </button>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "12px",
    width: "360px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    color: "#ffffff",
  },
  title: {
    marginBottom: "5px",
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    marginBottom: "30px",
    fontSize: "13px",
    textAlign: "center",
    color: "#94a3b8",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#cbd5e1",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "10px",
  },
  footerText: {
    marginTop: "20px",
    fontSize: "13px",
    textAlign: "center",
    color: "#94a3b8",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "500",
  },
};
