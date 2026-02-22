import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [signers, setSigners] = useState([""]);

  const addSigner = () => {
    setSigners([...signers, ""]);
  };

  const removeSigner = (index) => {
    const updated = [...signers];
    updated.splice(index, 1);
    setSigners(updated);
  };

  const updateSigner = (index, value) => {
    const updated = [...signers];
    updated[index] = value;
    setSigners(updated);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    const filteredSigners = signers.filter(email => email.trim() !== "");

    if (filteredSigners.length === 0) {
      alert("Please add at least one signer");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    formData.append(
      "data",
      new Blob(
        [JSON.stringify({ signerEmails: filteredSigners })],
        { type: "application/json" }
      )
    );

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8080/api/documents/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Document uploaded successfully");
      navigate("/documents");

    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <button
          style={styles.backBtn}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div style={styles.card}>
          <div style={styles.headerSection}>
            <h2 style={styles.title}>Upload Document</h2>
            <p style={styles.subtitle}>
              Add signers in sequential order. Each signer will receive the document after the previous one signs.
            </p>
          </div>

          {/* FILE UPLOAD */}
          <div style={styles.uploadBox}>
            <div style={styles.uploadInner}>
              <span style={styles.uploadIcon}>📄</span>
              <p style={styles.uploadText}>
                Click below to select a PDF file
              </p>
              <input
                type="file"
                accept="application/pdf"
                style={styles.fileInput}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          {file && (
            <div style={styles.filePreview}>
              ✔ Selected File: <strong>{file.name}</strong>
            </div>
          )}

          {/* SIGNER WORKFLOW */}
          <div style={styles.signerSection}>
            <h3 style={styles.sectionTitle}>Signing Workflow</h3>

            {signers.map((email, index) => (
              <div key={index} style={styles.signerRow}>
                <div style={styles.stepCircle}>
                  {index + 1}
                </div>

                <input
                  type="email"
                  placeholder="Enter signer email"
                  value={email}
                  onChange={(e) =>
                    updateSigner(index, e.target.value)
                  }
                  style={styles.signerInput}
                />

                {signers.length > 1 && (
                  <button
                    onClick={() => removeSigner(index)}
                    style={styles.removeBtn}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addSigner}
              style={styles.addBtn}
            >
              + Add Signer
            </button>
          </div>

          <button style={styles.uploadBtn} onClick={handleUpload}>
            🚀 Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MODERN STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    padding: "40px",
    fontFamily: "Segoe UI, sans-serif",
    color: "#ffffff",
  },
  container: {
    maxWidth: "750px",
    margin: "0 auto",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
  },
  headerSection: {
    marginBottom: "25px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.5",
  },
  uploadBox: {
    border: "2px dashed #334155",
    borderRadius: "12px",
    padding: "30px",
    backgroundColor: "#0f172a",
    marginBottom: "15px",
    textAlign: "center",
  },
  uploadInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  uploadIcon: {
    fontSize: "28px",
  },
  uploadText: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  fileInput: {
    marginTop: "10px",
    color: "#ffffff",
  },
  filePreview: {
    background: "#0f172a",
    padding: "10px",
    borderRadius: "8px",
    color: "#22c55e",
    fontSize: "13px",
    marginBottom: "20px",
  },
  signerSection: {
    marginTop: "20px",
  },
  sectionTitle: {
    marginBottom: "15px",
    fontSize: "16px",
  },
  signerRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    gap: "10px",
  },
  stepCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "bold",
  },
  signerInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#fff",
  },
  removeBtn: {
    background: "#ef4444",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
  addBtn: {
    marginTop: "10px",
    background: "transparent",
    border: "1px solid #2563eb",
    color: "#2563eb",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  uploadBtn: {
    marginTop: "30px",
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
};