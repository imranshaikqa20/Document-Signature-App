import { useState } from "react";

export default function SignaturePad({ onApply, onClose }) {
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [selectedFont, setSelectedFont] = useState("Pacifico");

  const signatureFonts = [
    "Pacifico",
    "Dancing Script",
    "Great Vibes",
    "Allura",
    "Sacramento",
    "Alex Brush",
    "Cedarville Cursive",
    "Satisfy",
    "Kaushan Script",
    "Yellowtail"
  ];

  const handleApply = () => {
    if (!fullName.trim()) {
      alert("Please enter full name");
      return;
    }

    onApply({
      fullName,
      initials,
      fontFamily: selectedFont,
      fontSize: 36,
      color: "#000"
    });
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Pacifico&family=Dancing+Script&family=Great+Vibes&family=Allura&family=Sacramento&family=Alex+Brush&family=Cedarville+Cursive&family=Satisfy&family=Kaushan+Script&family=Yellowtail&display=swap"
        rel="stylesheet"
      />

      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>Create Your Signature</h2>

          <input
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
          />

          <div style={styles.previewBox}>
            <span
              style={{
                fontFamily: selectedFont,
                fontSize: 34, // reduced
                color: "#ffffff"
              }}
            >
              {fullName || "Your Signature"}
            </span>
          </div>

          <div style={styles.fontGrid}>
            {signatureFonts.map((font) => (
              <div
                key={font}
                onClick={() => setSelectedFont(font)}
                style={{
                  ...styles.fontCard,
                  border:
                    selectedFont === font
                      ? "2px solid #3b82f6"
                      : "1px solid #334155"
                }}
              >
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 22, // reduced
                    color: "#ffffff"
                  }}
                >
                  {fullName || "Signature"}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button style={styles.applyBtn} onClick={handleApply}>
              Apply Signature
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================== STYLES ================== */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    background: "#1e293b",
    padding: "20px", // reduced
    width: "600px", // reduced from 750px
    maxHeight: "85vh",
    overflowY: "auto",
    borderRadius: "12px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
    color: "#ffffff"
  },
  title: {
    marginBottom: "15px",
    fontSize: "20px"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#ffffff",
    marginBottom: "15px",
    fontSize: "14px"
  },
  previewBox: {
    background: "#0f172a",
    border: "1px solid #334155",
    padding: "18px", // reduced
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "20px"
  },
  fontGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // smaller cards
    gap: "12px"
  },
  fontCard: {
    padding: "12px", // reduced
    borderRadius: "10px",
    cursor: "pointer",
    background: "#0f172a",
    textAlign: "center",
    transition: "0.2s"
  },
  buttonRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px"
  },
  cancelBtn: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #64748b",
    background: "transparent",
    color: "#cbd5e1",
    cursor: "pointer"
  },
  applyBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#3b82f6",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer"
  }
};