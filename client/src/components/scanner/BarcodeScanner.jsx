import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [active, setActive] = useState(false);

  const start = async () => {
    if (html5QrRef.current) return;

    const scanner = new Html5Qrcode('barcode-reader');
    html5QrRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          scanner.stop().catch(() => {});
          html5QrRef.current = null;
          setActive(false);
          onScan(decodedText);
        },
        () => {}
      );
      setActive(true);
    } catch (err) {
      html5QrRef.current = null;
      onError?.(err?.message || 'Camera access denied');
    }
  };

  const stop = async () => {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setActive(false);
  };

  useEffect(() => {
    return () => { stop(); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-gray-900" style={{ minHeight: 280 }}>
        <div id="barcode-reader" ref={scannerRef} />
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Tap below to start camera</p>
            </div>
          </div>
        )}
      </div>

      {!active ? (
        <button onClick={start} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Start Scanning
        </button>
      ) : (
        <button onClick={stop} className="btn-secondary">
          Stop Camera
        </button>
      )}
    </div>
  );
}
