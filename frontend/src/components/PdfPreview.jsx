import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import api from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfPreview({ documentId, signatureData, onClose }) {

  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(null);
  const [isSigned, setIsSigned] = useState(false);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(0);

  const wrapperRef = useRef(null);
  const scrollRef = useRef(null);

  /* ================= LOAD PDF ================= */
  useEffect(() => {
    if (documentId) {
      loadPdf();
      loadAudit();
    }
  }, [documentId, auditPage]);

  // 🔥 Cleanup object URL (prevents memory leak)
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const loadPdf = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/documents/${documentId}/view?t=${Date.now()}`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });

      if (pdfUrl) URL.revokeObjectURL(pdfUrl); // cleanup old URL

      setPdfUrl(URL.createObjectURL(blob));
      setPosition(null);

    } catch {
      alert("Failed to load PDF");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD AUDIT ================= */
  const loadAudit = async () => {
    try {
      const res = await api.get(
        `/audit/${documentId}?page=${auditPage}&size=5`
      );
      setAuditLogs(res.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= HANDLE DROP ================= */
  const handleDrop = (e) => {
    e.preventDefault();

    if (!wrapperRef.current || !scrollRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const scrollTop = scrollRef.current.scrollTop;

    const x = e.clientX - wrapperRect.left;
    const y = e.clientY - wrapperRect.top + scrollTop;

    setPosition({ x, y });
  };

  const allowDrop = (e) => e.preventDefault();

  /* ================= SIGN DOCUMENT ================= */
  const handleSign = async () => {

    if (!signatureData || !position) {
      alert("Drag signature onto document first");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const name = signatureData.fullName;
      const fontSize = 40;

      // 🔥 Set font BEFORE measuring
      ctx.font = `italic ${fontSize}px ${signatureData.fontFamily || "cursive"}`;
      const textWidth = ctx.measureText(name).width;

      canvas.width = textWidth + 20;
      canvas.height = fontSize + 20;

      // 🔥 MUST reset font after resizing canvas
      ctx.font = `italic ${fontSize}px ${signatureData.fontFamily || "cursive"}`;
      ctx.fillStyle = signatureData.color || "#000";
      ctx.fillText(name, 10, fontSize);

      const signatureImage = canvas.toDataURL("image/png");

      const pdfCanvas = wrapperRef.current?.querySelector("canvas");
      if (!pdfCanvas) return alert("PDF not ready");

      const displayWidth = pdfCanvas.offsetWidth;
      const displayHeight = pdfCanvas.offsetHeight;

      const xPercent = position.x / displayWidth;
      const yPercent = position.y / displayHeight;

      await api.post(`/documents/${documentId}/sign`, {
        signatureImage,
        xPercent,
        yPercent,
        widthPercent: 0.25,
        heightPercent: 0.08,
        page: 1,
      });

      setIsSigned(true);
      setPosition(null);

      await loadPdf();
      await loadAudit();

      alert("Signed Successfully ✅");

    } catch {
      alert("Sign failed");
    }
  };

  /* ================= DOWNLOAD ================= */
  const handleDownload = async () => {

    const res = await api.get(
      `/documents/${documentId}/download`,
      { responseType: "blob" }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "signed-document.pdf";
    link.click();

    await loadAudit();
  };

  return (
    <div style={overlay}>
      <div style={modal}>

        <div style={header}>
          <h2>📄 Document Preview</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={body}>

          <div style={pdfSection}>
            {loading && <p style={{ color: "#fff" }}>Loading PDF...</p>}

            {pdfUrl && (
              <div
                style={pdfWrapper}
                ref={wrapperRef}
                onDrop={handleDrop}
                onDragOver={allowDrop}
              >
                <div style={pdfScrollArea} ref={scrollRef}>
                  <Document file={pdfUrl} key={pdfUrl}>
                    <Page pageNumber={1} width={850} />
                  </Document>
                </div>

                {position && !isSigned && (
                  <div
                    style={{
                      position: "absolute",
                      left: position.x,
                      top: position.y,
                      zIndex: 9999,
                      fontSize: 34,
                      fontFamily: signatureData?.fontFamily,
                      color: signatureData?.color,
                      fontStyle: "italic",
                      background: "rgba(255,255,255,0.9)",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "move",
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    {signatureData?.fullName}
                    <span
                      onClick={() => setPosition(null)}
                      style={{
                        color: "red",
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      ✕
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={rightPanel}>

            <button style={signBtn} onClick={handleSign}>
              ✅ Place & Sign
            </button>

            <button style={downloadBtn} onClick={handleDownload}>
              ⬇ Download Signed PDF
            </button>

            {signatureData && !isSigned && (
              <div
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/plain", "signature")
                }
                style={dragSource}
              >
                Drag This Signature ↓
                <div style={signaturePreview(signatureData)}>
                  {signatureData.fullName}
                </div>
              </div>
            )}

            <h3 style={{ marginTop: 20 }}>📝 Audit Timeline</h3>

            <div style={auditContainer}>
              {auditLogs.map((log, i) => (
                <div key={i} style={auditItem}>
                  <div style={{ fontWeight: "bold" }}>
                    {log.action.replaceAll("_", " ")}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {log.performedBy}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>
                    {new Date(log.performedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <button onClick={() => setAuditPage(p => Math.max(p - 1, 0))}>◀</button>
              <button onClick={() => setAuditPage(p => p + 1)}>▶</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
/* ================= STYLES ================= */

const dragSource = {
  marginTop: 20,
  padding: 12,
  background: "#1f1f2e",
  borderRadius: 8,
  cursor: "grab",
  textAlign: "center",
};

const signaturePreview = (s) => ({
  fontSize: 32,
  fontFamily: s.fontFamily,
  color: s.color,
  fontStyle: "italic",
  marginTop: 10,
});

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  width: "95%",
  height: "95vh",
  background: "#1e1e2f",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
};

const header = {
  padding: 16,
  background: "#151522",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
};

const closeBtn = {
  background: "#e53935",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const body = { display: "flex", flex: 1 };

const pdfSection = {
  flex: 1,
  padding: 20,
  background: "#2a2a3d",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const pdfWrapper = {
  background: "#fff",
  borderRadius: 8,
  padding: 10,
  position: "relative",
  width: "100%",
  maxWidth: 900,
};

const pdfScrollArea = {
  height: "75vh",
  overflowY: "auto",
  display: "flex",
  justifyContent: "center",
};

const rightPanel = {
  width: 320,
  padding: 20,
  background: "#12121c",
  color: "#fff",
};

const signBtn = {
  padding: 14,
  background: "#2e7d32",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
};

const downloadBtn = {
  padding: 14,
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
  marginTop: 10,
};

const auditContainer = {
  marginTop: 10,
  maxHeight: 260,
  overflowY: "auto",
};

const auditItem = {
  background: "#1f1f2e",
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
  borderLeft: "4px solid #4cafef",
};