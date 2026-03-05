import { useState } from 'react';
import api from '../../api/axios';
import FoodCard from './FoodCard';
import EmptyState from '../ui/EmptyState';
import toast from 'react-hot-toast';

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearched(true);
    try {
      const { data } = await api.get('/food/search', { params: { q: query } });
      setResults(data);
    } catch {
      toast.error('Search failed — please try again');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Search for a food..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary px-4" disabled={searching}>
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {!searched && (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Search for foods"
          description="Type a food name to find nutrition info"
        />
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((food, i) => (
            <FoodCard key={food._id || i} food={food} />
          ))}
        </div>
      )}

      {searched && !searching && results.length === 0 && (
        <EmptyState
          title="No results found"
          description="Try a different search term"
        />
      )}
    </div>
  );
}
