import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import QRCode from 'qrcode';
import { X, Printer, Download, Copy, Check, QrCode, Tag, MapPin, DollarSign } from 'lucide-react';
import { ProductItem } from '../../api/client';

interface SkuQrGeneratorModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const SkuQrGeneratorModal: React.FC<SkuQrGeneratorModalProps> = ({ product, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!product || !canvasRef.current) return;

    const payload = JSON.stringify({
      sku: product.sku,
      name: product.name,
      category: product.category,
      unitCost: product.unitCost,
      location: product.locationCode || 'WH/Stock1',
      uom: product.uom,
      timestamp: new Date().toISOString()
    });

    QRCode.toCanvas(
      canvasRef.current,
      payload,
      {
        width: 180,
        margin: 1,
        color: {
          dark: '#0a0d14',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      },
      (error: any) => {
        if (error) {
          console.error('QR Generation Error:', error);
        } else if (canvasRef.current) {
          setQrDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      }
    );
  }, [product]);

  if (!product) return null;

  const handleCopyPayload = () => {
    const payload = `STOCKSENSE-SKU:${product.sku}|LOC:${product.locationCode || 'WH/Stock1'}|COST:${product.unitCost}`;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `StockSense-Tag-${product.sku}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label - ${product.sku}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 20px;
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .label-card {
              width: 380px;
              border: 2px dashed #000;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
            }
            .header {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
            }
            .sku-title {
              font-size: 20px;
              font-weight: 800;
              font-family: monospace;
              margin: 4px 0;
            }
            .prod-name {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .details {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              border-top: 1px solid #ccc;
              padding-top: 8px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">StockSense Enterprise Bin & Item Tag</div>
            <div class="sku-title">${product.sku}</div>
            <div class="prod-name">${product.name}</div>
            <img src="${qrDataUrl}" width="160" height="160" />
            <div class="details">
              <span><strong>BIN:</strong> ${product.locationCode || 'WH/Stock1'}</span>
              <span><strong>UoM:</strong> ${product.uom}</span>
              <span><strong>COST:</strong> ₹${product.unitCost}</span>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '6px'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}
          >
            <QrCode size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              SKU Barcode & Bin Tag Generator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Instant printable QR tag for physical warehouse bins & packaging
            </p>
          </div>
        </div>

        {/* Physical Tag Mockup Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#0f172a',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '2px solid #e2e8f0',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: '#475569',
              textTransform: 'uppercase',
              marginBottom: '0.35rem'
            }}
          >
            📦 STOCKSENSE ENTERPRISE INVENTORY
          </div>

          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: '#1e293b',
              letterSpacing: '1px'
            }}
          >
            {product.sku}
          </div>

          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              marginTop: '0.15rem',
              marginBottom: '0.75rem'
            }}
          >
            {product.name}
          </div>

          {/* QR Canvas Display */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
            <canvas ref={canvasRef} style={{ borderRadius: '8px' }} />
          </div>

          {/* Simulated 1D Barcode Strip */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2px',
              height: '24px',
              margin: '0.5rem 0',
              opacity: 0.85
            }}
          >
            {[4, 2, 6, 2, 8, 3, 5, 2, 7, 2, 4, 3, 6, 2, 8, 4, 3, 5, 2, 7, 3, 5].map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w}px`,
                  height: '100%',
                  background: '#0f172a'
                }}
              />
            ))}
          </div>

          {/* Tag Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              borderTop: '1px solid #cbd5e1',
              paddingTop: '0.75rem',
              marginTop: '0.5rem',
              fontSize: '0.7rem',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ color: '#64748b', fontSize: '0.625rem' }}>LOCATION</div>
              <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <MapPin size={10} /> {product.locationCode || 'WH/Stock1'}
              </strong>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.625rem' }}>CATEGORY</div>
              <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Tag size={10} /> {product.category}
              </strong>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.625rem' }}>UNIT COST</div>
              <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <DollarSign size={10} /> ₹{product.unitCost}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem'
            }}
          >
            <Printer size={16} />
            Print Bin Label
          </button>

          <button
            onClick={handleDownload}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem'
            }}
          >
            <Download size={16} />
            Download PNG
          </button>
        </div>

        <button
          onClick={handleCopyPayload}
          style={{
            width: '100%',
            marginTop: '0.75rem',
            background: 'none',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            padding: '0.5rem',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          {copied ? 'SKU Barcode Matrix Copied to Clipboard!' : 'Copy Barcode Payload'}
        </button>
      </div>
    </div>
  );
};
