import React from 'react';
import { Plus, TrendingUp, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { JobListing } from '../types';

const MOCK_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'TikTok Viral Challenge - Energy Drink',
    brandName: 'Bolt Energy',
    commissionRate: 15,
    description: 'Looking for high energy creators to showcase our new flavor.',
    requirements: ['10k+ followers', 'USA Based'],
    postedDate: '2023-10-25'
  },
  {
    id: '2',
    title: 'Skincare Routine Video - Evening',
    brandName: 'Glow Co.',
    commissionRate: 20,
    description: 'Authentic evening routine featuring our night serum.',
    requirements: ['Aesthetic style', 'Female audience'],
    postedDate: '2023-10-24'
  }
];

export const BusinessDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Business Dashboard</h1>
            <p className="text-slate-500">Manage your campaigns and creator partnerships.</p>
          </div>
          <Button className="gap-2">
            <Plus size={18} /> Post New Campaign
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Sales</p>
                <h3 className="text-2xl font-bold text-slate-900">$12,450</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Creators</p>
                <h3 className="text-2xl font-bold text-slate-900">14</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Active Campaigns</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {MOCK_JOBS.map((job) => (
              <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-medium text-slate-900">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-1">{job.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.requirements.map((req, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {job.commissionRate}% Comm.
                    </span>
                    <p className="mt-1 text-xs text-slate-400">Posted {job.postedDate}</p>
                  </div>
                </div>
              </div>
            ))}
            {MOCK_JOBS.length === 0 && (
               <div className="p-12 text-center text-slate-500">
                 No active campaigns. Start by posting one!
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};