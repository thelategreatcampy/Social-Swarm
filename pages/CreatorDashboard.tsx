import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../components/Button';

export const CreatorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Creator Marketplace</h1>
            <p className="text-slate-500">Find products you love and start earning.</p>
          </div>
          <div className="relative w-full sm:w-96">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
               <Search size={18} className="text-slate-400" />
             </div>
             <input 
                type="text" 
                className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="Search brands or products..."
             />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Placeholders for Job Cards */}
           {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
               <div className="h-48 bg-slate-200 animate-pulse"></div>
               <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                   <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                   <div className="h-6 w-16 bg-green-100 rounded-full"></div>
                 </div>
                 <div className="h-6 w-3/4 bg-slate-200 rounded mb-4 animate-pulse"></div>
                 <div className="space-y-2 mb-6">
                   <div className="h-3 w-full bg-slate-100 rounded"></div>
                   <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                 </div>
                 <Button className="w-full" variant="outline">View Details</Button>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};