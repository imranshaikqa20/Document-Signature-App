import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PdfPreview from "../components/PdfPreview";
import SignaturePad from "../components/SignaturePad";

export default function Documents() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [previewDocId, setPreviewDocId] = useState(null);
  const [signDoc, setSignDoc] = useState(null);
  const [signatureData, setSignatureData] = useState(null);

  /* ========================= LOAD DOCUMENTS ========================= */
  const loadDocuments = () => {
    api
      .get("/documents")
      .then((res) => {
        setDocuments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  /* ========================= DELETE ========================= */
  const deleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await api.delete(`/documents/${docId}`);
      loadDocuments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
    }
  };

  /* ========================= APPLY SIGN ========================= */
  const handleApplySignature = (data) => {
    setSignatureData(data);
    setSignDoc(null);
    setPreviewDocId(signDoc.id);
  };

  /* ========================= FILTER + SEARCH LOGIC ========================= */
  const filteredDocuments = documents
    .filter((doc) =>
      filter === "ALL" ? true : doc.status === filter
    )
    .filter((doc) =>
      doc.fileName.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#94a3b8" }}>Loading documents...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <h2 style={styles.title}>My Documents</h2>
        </div>

        {/* FILTER + SEARCH BAR */}
        <div style={styles.topBar}>
          {/* Status Filter */}
          <div style={styles.filterContainer}>
            {["ALL", "PENDING", "SIGNED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === status ? styles.activeFilter : {}),
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="🔍 Search by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {filteredDocuments.length === 0 && (
          <p style={styles.emptyText}>
            No documents match your search/filter.
          </p>
        )}

        <div style={styles.grid}>
          {filteredDocuments.map((doc) => (
            <div key={doc.id} style={styles.card}>
              <h3 style={styles.fileName}>{doc.fileName}</h3>

              <p style={styles.meta}>
                Status:{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      doc.status === "SIGNED"
                        ? "#22c55e"
                        : "#facc15",
                  }}
                >
                  {doc.status}
                </span>
              </p>

              <p style={styles.meta}>
                Uploaded:{" "}
                {new Date(doc.uploadedAt).toLocaleString()}
              </p>

              <p style={styles.workflowHint}>
                {doc.status === "SIGNED"
                  ? "✔ Fully Signed"
                  : "⏳ Waiting for signers"}
              </p>

              <div style={styles.actions}>
                <button
                  style={styles.previewBtn}
                  onClick={() => setPreviewDocId(doc.id)}
                >
                  Preview
                </button>

                {doc.status !== "SIGNED" && (
                  <button
                    style={styles.signBtn}
                    onClick={() => setSignDoc(doc)}
                  >
                    Sign
                  </button>
                )}

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteDocument(doc.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PREVIEW */}
      {previewDocId && (
        <PdfPreview
          documentId={previewDocId}
          signatureData={signatureData}
          onClose={() => {
            setPreviewDocId(null);
            setSignatureData(null);
          }}
        />
      )}

      {/* SIGN PAD */}
      {signDoc && (
        <SignaturePad
          onApply={handleApplySignature}
          onClose={() => setSignDoc(null)}
        />
      )}
    </div>
  );
}

/* ========================= STYLES ========================= */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "40px",
    fontFamily: "Segoe UI, sans-serif",
    color: "#ffffff",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "20px",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "15px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "600",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "25px",
    gap: "15px",
  },
  filterContainer: {
    display: "flex",
    gap: "10px",
  },
  filterBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "12px",
  },
  activeFilter: {
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid #2563eb",
  },
  searchContainer: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-end",
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#fff",
    width: "250px",
    outline: "none",
  },
  emptyText: {
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  fileName: {
    fontSize: "16px",
    marginBottom: "10px",
  },
  meta: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  workflowHint: {
    fontSize: "12px",
    marginTop: "8px",
    marginBottom: "8px",
    color: "#38bdf8",
  },
  actions: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  previewBtn: {
    background: "#2563eb",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  signBtn: {
    background: "#22c55e",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};