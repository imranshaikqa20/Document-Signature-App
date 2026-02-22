import { useState } from "react";
import SignaturePad from "./SignaturePad";
import PdfPreview from "./PdfPreview";

export default function SignFlow({ documentId, onClose }) {
  const [step, setStep] = useState("SIGNATURE"); // SIGNATURE | PREVIEW
  const [signatureData, setSignatureData] = useState(null);

  /* ================= APPLY HANDLER ================= */
  const handleApplySignature = (data) => {
    setSignatureData(data);
    setStep("PREVIEW");
  };

  /* ================= CLOSE HANDLER ================= */
  const handleClose = () => {
    setSignatureData(null);
    setStep("SIGNATURE");
    onClose?.();
  };

  return (
    <>
      {step === "SIGNATURE" && (
        <SignaturePad
          onApply={handleApplySignature}
          onClose={handleClose}
        />
      )}

      {step === "PREVIEW" && (
        <PdfPreview
          documentId={documentId}
          signatureData={signatureData}
          onClose={handleClose}
        />
      )}
    </>
  );
}
