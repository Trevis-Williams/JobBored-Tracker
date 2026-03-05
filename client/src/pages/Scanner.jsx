import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
import FoodCard from '../components/food/FoodCard';
import useScanner from '../hooks/useScanner';
import toast from 'react-hot-toast';

export default function Scanner() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const meal = params.get('meal') || 'snack';
  const { food, loading, error, lookupBarcode, reset } = useScanner();
  const [manualCode, setManualCode] = useState('');

  const handleScan = async (code) => {
    toast.loading('Looking up product...', { id: 'scan' });
    const result = await lookupBarcode(code);
    toast.dismiss('scan');

    if (result) {
      navigate(`/food/${result._id}?meal=${meal}`);
    }
  };

  const handleManual = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  return (
    <div>
      <div className="page-container pt-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Go back">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Scan Barcode</h1>
        </div>
        <BarcodeScanner
          onScan={handleScan}
          onError={(msg) => toast.error(msg)}
        />

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-gray-500 mt-2 text-sm">Looking up product...</p>
          </div>
        )}

        {error && (
          <div className="card bg-danger-50 border-danger-100 text-danger-600 text-sm text-center">
            {error}
          </div>
        )}

        {food && <FoodCard food={food} />}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-4 text-gray-400">or enter barcode manually</span>
          </div>
        </div>

        <form onSubmit={handleManual} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            className="input-field flex-1"
            placeholder="e.g. 5000159484695"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4">
            Look Up
          </button>
        </form>

        <button
          onClick={() => navigate('/search')}
          className="btn-ghost w-full"
        >
          Search by name instead
        </button>
      </div>
    </div>
  );
}
