import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    // 🔥 Remove JWT
    localStorage.removeItem("token");

    // 🔥 Optional: clear everything (safer)
    localStorage.clear();

    // 🔥 Replace history (prevents back navigation)
    navigate("/", { replace: true });

    // 🔥 Force refresh to ensure old auth state is gone
    window.location.reload();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Dashboard</h2>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>

        <p style={styles.subtitle}>
          Welcome to Document Signature App
        </p>

        <div style={styles.cardContainer}>
          {/* Upload Card */}
          <div
            style={styles.card}
            onClick={() => navigate("/upload")}
          >
            <h3 style={styles.cardTitle}>📤 Upload Document</h3>
            <p style={styles.cardDesc}>
              Upload a new document and assign multiple signers.
            </p>
          </div>

          {/* View Documents Card */}
          <div
            style={styles.card}
            onClick={() => navigate("/documents")}
          >
            <h3 style={styles.cardTitle}>📄 My Documents</h3>
            <p style={styles.cardDesc}>
              View document status, signer workflow and audit trail.
            </p>
          </div>

          {/* Workflow Info Card */}
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>👥 Multi-Signer Workflow</h3>
            <p style={styles.cardDesc}>
              Documents now support ordered signing. Only the next
              assigned signer can place their signature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    fontFamily: "Segoe UI, sans-serif",
    padding: "40px",
    color: "#ffffff",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "26px",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  subtitle: {
    marginTop: "10px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  cardContainer: {
    marginTop: "40px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  infoCard: {
    backgroundColor: "#172033",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    borderLeft: "4px solid #1976d2",
  },
  cardTitle: {
    marginBottom: "10px",
    fontSize: "18px",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#94a3b8",
  },
};