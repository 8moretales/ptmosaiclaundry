import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Shirt } from 'lucide-react';
import LaundryForm from './components/LaundryForm';
import LaundryTable from './components/LaundryTable';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Shirt className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">Villa Laundry Tracker</h1>
        </div>

        <div className="space-y-8">
          <LaundryForm />
          <LaundryTable />
        </div>
      </div>
    </div>
  );
}

export default App;