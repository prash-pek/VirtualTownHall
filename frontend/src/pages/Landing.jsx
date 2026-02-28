import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ZipSearch from '../components/ZipSearch';

export default function Landing() {
  const navigate = useNavigate();

  function handleSearch({ zip, topics }) {
    const params = new URLSearchParams({ zip });
    if (topics.length) params.set('topics', topics.join(','));
    navigate(`/candidates?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TownHall AI</h1>
        <p className="text-xl text-gray-600 mb-8">
          Have a real conversation with every candidate on your ballot.
        </p>
        <ZipSearch onSearch={handleSearch} />
        <p className="mt-6 text-sm text-gray-500">
          Are you a candidate?{' '}
          <a href="/auth/register" className="text-blue-600 hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
}
