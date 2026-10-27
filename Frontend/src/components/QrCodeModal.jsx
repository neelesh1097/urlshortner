import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check, QrCode as QrIcon } from "lucide-react";

export default function QrCodeModal({ urlItem, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (urlItem && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, urlItem.shortUrlFull, {
        width: 240,
        margin: 2,
        color: {
          dark: "#080a10",
          light: "#ffffff",
        },
      }, (error) => {
        if (error) console.error("QR Code generation error:", error);
      });
    }
  }, [urlItem]);

  if (!urlItem) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qrcode-${urlItem.short_url}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(urlItem.shortUrlFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <QrIcon size={20} className="text-cyan" />
            <h3>QR Code Generator</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="qr-body">
          <div className="qr-canvas-wrapper">
            <canvas ref={canvasRef} className="qr-canvas" />
          </div>

          <div className="qr-url-box mono">
            <span>{urlItem.shortUrlFull}</span>
          </div>

          <p className="qr-target-hint text-dim">
            Points to: {urlItem.full_url}
          </p>

          <div className="qr-actions-row">
            <button onClick={handleDownload} className="btn btn-primary" id="download-qr-btn">
              <Download size={15} />
              <span>Download PNG</span>
            </button>
            <button onClick={handleCopy} className="btn btn-secondary" id="copy-qr-url-btn">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
