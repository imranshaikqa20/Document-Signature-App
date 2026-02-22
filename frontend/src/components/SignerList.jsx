import React from "react";

/**
 * Props:
 *  signers: [
 *      {
 *          id,
 *          signerEmail,
 *          signingOrder,
 *          status, // PENDING or SIGNED
 *          signedAt
 *      }
 *  ]
 *
 *  currentUserEmail: string
 */

export default function SignerList({ signers = [], currentUserEmail }) {
  if (!signers.length) {
    return (
      <div style={container}>
        <p style={{ opacity: 0.7 }}>No signers assigned</p>
      </div>
    );
  }

  // Find next pending signer
  const nextPending = signers.find(s => s.status === "PENDING");

  return (
    <div style={container}>
      <h3 style={title}>👥 Signer Workflow</h3>

      {signers.map((signer) => {
        const isCurrentUser = signer.signerEmail === currentUserEmail;
        const isNext = nextPending && signer.id === nextPending.id;
        const isSigned = signer.status === "SIGNED";

        return (
          <div
            key={signer.id}
            style={{
              ...item,
              borderLeft: `4px solid ${
                isSigned
                  ? "#2e7d32"
                  : isNext
                  ? "#1976d2"
                  : "#555"
              }`,
              background:
                isCurrentUser
                  ? "rgba(25,118,210,0.15)"
                  : "#1f1f2e",
            }}
          >
            <div style={rowTop}>
              <span style={{ fontWeight: "bold" }}>
                Step {signer.signingOrder}
              </span>

              <span
                style={{
                  ...statusBadge,
                  background: isSigned
                    ? "#2e7d32"
                    : isNext
                    ? "#1976d2"
                    : "#555",
                }}
              >
                {isSigned
                  ? "SIGNED"
                  : isNext
                  ? "PENDING (Active)"
                  : "LOCKED"}
              </span>
            </div>

            <div style={email}>
              {signer.signerEmail}
              {isCurrentUser && (
                <span style={youBadge}> (You)</span>
              )}
            </div>

            {isSigned && signer.signedAt && (
              <div style={timestamp}>
                Signed on{" "}
                {new Date(signer.signedAt).toLocaleString()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  marginTop: 20,
  padding: 16,
  background: "#12121c",
  borderRadius: 10,
  color: "#fff",
};

const title = {
  marginBottom: 12,
  fontSize: 16,
};

const item = {
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
  transition: "0.2s ease",
};

const rowTop = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 6,
};

const email = {
  fontSize: 14,
  opacity: 0.9,
};

const timestamp = {
  fontSize: 12,
  opacity: 0.6,
  marginTop: 4,
};

const statusBadge = {
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: "bold",
  color: "#fff",
};

const youBadge = {
  color: "#4cafef",
  fontWeight: "bold",
};