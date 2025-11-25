/**
 * Admin Analytics Dashboard
 * Comprehensive view of calculator leads, attribution, and email performance
 */

'use client';

import { LeadDetailModal } from '@/components/admin/LeadDetailModal';
import { MetricCard } from '@/components/admin/MetricCard';
import { SimpleBarChart } from '@/components/admin/SimpleBarChart';
import { TrendLineChart } from '@/components/admin/TrendLineChart';
import {
    Calendar,
    Download,
    Filter,
    Mail,
    Search,
    Target,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AnalyticsOverview {
  totalLeads: number;
  qualityBreakdown: { hot: number; warm: number; cold: number };
  typeBreakdown: Record<string, number>;
  conversionRate: string;
  contactRate: string;
  emailMetrics: {
    sent: number;
    opened: number;
    clicked: number;
    openRate: string;
    clickRate: string;
  };
  sourceBreakdown: Record<string, number>;
}

interface DailyDataPoint {
  date: string;
  leads: number;
  contacted: number;
  conversions: number;
  hot: number;
  warm: number;
  cold: number;
}

interface TrendsData {
  dailyData: DailyDataPoint[];
  cumulativeLeads: Array<{ date: string; value: number }>;
  cumulativeConversions: Array<{ date: string; value: number }>;
}

interface Lead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  calculator_type: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  lead_score: number;
  lead_quality: string;
  created_at: string;
  contacted: boolean;
  converted: boolean;
  contacted_at: string | null;
  converted_at: string | null;
  conversion_value: number | null;
  attribution: {
    source: string;
    medium: string;
    campaign: string | null;
    device_type: string | null;
    browser: string | null;
    referrer: string | null;
  } | null;
}

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]); // Store unfiltered leads for client-side search
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [calculatorFilter, setCalculatorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/overview?days=${timeRange}`);
      const data = await response.json();
      setOverview(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  const fetchTrends = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/trends?days=${timeRange}`);
      const data = await response.json();
      setTrends(data);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
    fetchTrends();
  }, [fetchAnalytics, fetchTrends]);

  const fetchLeads = useCallback(async () => {
    try {
      const qualityParam = qualityFilter !== 'all' ? `&quality=${qualityFilter}` : '';
      const response = await fetch(`/api/admin/analytics/leads?limit=200${qualityParam}`);
      const data = await response.json();
      const fetchedLeads = data.leads || [];
      setAllLeads(fetchedLeads);
      setLeads(fetchedLeads); // Will be filtered by useEffect
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  }, [qualityFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Client-side filtering for search and calculator type
  useEffect(() => {
    let filtered = [...allLeads];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.email.toLowerCase().includes(query) ||
        lead.name?.toLowerCase().includes(query) ||
        lead.company?.toLowerCase().includes(query)
      );
    }

    // Apply calculator type filter
    if (calculatorFilter !== 'all') {
      filtered = filtered.filter(lead => lead.calculator_type === calculatorFilter);
    }

    setLeads(filtered);
  }, [searchQuery, calculatorFilter, allLeads]);



  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleLeadUpdate = (leadId: string, updates: Partial<Lead>) => {
    // Update the lead in the local state
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, ...updates } : lead
      )
    );

    // Update selected lead if it's the one being updated
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, ...updates } : null);
    }

    // Refresh analytics overview to update counts
    fetchAnalytics();
  };

  const handleExport = () => {
    const qualityParam = qualityFilter !== 'all' ? `&quality=${qualityFilter}` : '';
    const exportUrl = `/api/admin/analytics/export?days=${timeRange}${qualityParam}`;

    // Trigger download
    window.location.href = exportUrl;
  };

  if (isLoading || !overview) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
          <p className="mt-4 text-text-secondary dark:text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const calculatorData = Object.entries(overview.typeBreakdown).map(([type, count]) => ({
    label: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  }));

  const sourceData = Object.entries(overview.sourceBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({
      label: source.charAt(0).toUpperCase() + source.slice(1),
      value: count,
    }));

  const qualityData = [
    { label: 'Hot Leads', value: overview.qualityBreakdown.hot, color: '#ef4444' },
    { label: 'Warm Leads', value: overview.qualityBreakdown.warm, color: '#f59e0b' },
    { label: 'Cold Leads', value: overview.qualityBreakdown.cold, color: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-text-inverted">
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary">
                Calculator leads, attribution, and email performance
              </p>
            </div>

            {/* Time Range Selector and Export */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-text-muted" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="rounded-md border-border-primary py-2 pl-3 pr-10 text-sm focus:border-cyan-600 focus:ring-cyan-600 dark:border-border-primary-dark dark:bg-bg-secondary-dark dark:text-text-inverted"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>

              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filters Bar */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by email, name, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border-border-primary py-2 pl-10 pr-10 text-sm focus:border-cyan-600 focus:ring-cyan-600 dark:border-border-primary-dark dark:bg-bg-secondary-dark dark:text-text-inverted dark:placeholder-text-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary dark:hover:text-text-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Calculator Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={calculatorFilter}
                onChange={(e) => setCalculatorFilter(e.target.value)}
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Calculators</option>
                <option value="roi-calculator">ROI Calculator</option>
                <option value="cost-estimator">Cost Estimator</option>
                <option value="performance-calculator">Performance Calculator</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-text-secondary dark:text-text-secondary">
              Showing {leads.length} of {allLeads.length} leads
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Leads"
            value={overview.totalLeads}
            subtitle={`${timeRange} days`}
            icon={<Users className="h-6 w-6 text-cyan-600" />}
          />

          <MetricCard
            title="Hot Leads"
            value={overview.qualityBreakdown.hot}
            subtitle="75+ lead score"
            icon={<TrendingUp className="h-6 w-6 text-red-600" />}
          />

          <MetricCard
            title="Email Open Rate"
            value={`${overview.emailMetrics.openRate}%`}
            subtitle={`${overview.emailMetrics.opened} of ${overview.emailMetrics.sent} opened`}
            icon={<Mail className="h-6 w-6 text-blue-600" />}
          />

          <MetricCard
            title="Conversion Rate"
            value={`${overview.conversionRate}%`}
            subtitle="Leads to customers"
            icon={<Target className="h-6 w-6 text-green-600" />}
          />
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <SimpleBarChart
            title="Leads by Calculator Type"
            data={calculatorData}
          />

          <SimpleBarChart
            title="Traffic Sources"
            data={sourceData}
          />
        </div>

        <div className="mb-8">
          <SimpleBarChart
            title="Lead Quality Distribution"
            data={qualityData}
          />
        </div>

        {/* Trend Charts */}
        {trends && (
          <div className="mb-8 space-y-6">
            <h2 className="text-xl font-semibold text-text-primary dark:text-text-inverted">
              Trends Over Time
            </h2>

            <div className="grid gap-6 lg:grid-cols-2">
              <TrendLineChart
                title="Daily Leads"
                datasets={[{ label: 'Daily Leads', data: trends.dailyData.map(d => ({ date: d.date, value: d.leads })), color: '#06b6d4' }]}
              />

              <TrendLineChart
                title="Daily Conversions"
                datasets={[{ label: 'Daily Conversions', data: trends.dailyData.map(d => ({ date: d.date, value: d.conversions })), color: '#10b981' }]}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <TrendLineChart
                title="Cumulative Leads Growth"
                datasets={[{ label: 'Cumulative Leads Growth', data: trends.cumulativeLeads, color: '#8b5cf6' }]}
                showPoints={false}
              />

              <TrendLineChart
                title="Lead Quality Trends"
                datasets={[
                  {
                    label: 'Hot Leads',
                    data: trends.dailyData.map(d => ({ date: d.date, value: d.hot })),
                    color: '#ef4444',
                  },
                  {
                    label: 'Warm Leads',
                    data: trends.dailyData.map(d => ({ date: d.date, value: d.warm })),
                    color: '#f59e0b',
                  },
                  {
                    label: 'Cold Leads',
                    data: trends.dailyData.map(d => ({ date: d.date, value: d.cold })),
                    color: '#6b7280',
                  },
                ]}
              />
            </div>
          </div>
        )}

        {/* Recent Leads Table */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-inverted">
                Recent Leads
              </h3>

              {/* Quality Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-text-muted" />
                <select
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value)}
                  className="rounded-md border-border-primary py-2 pl-3 pr-10 text-sm focus:border-cyan-600 focus:ring-cyan-600 dark:border-border-primary-dark dark:bg-bg-secondary-dark dark:text-text-inverted"
                >
                  <option value="all">All Leads</option>
                  <option value="hot">Hot Leads Only</option>
                  <option value="warm">Warm Leads Only</option>
                  <option value="cold">Cold Leads Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary">
                    Calculator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => handleLeadClick(lead)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary dark:text-text-inverted">
                          {lead.name || lead.email}
                        </div>
                        {lead.name && (
                          <div className="text-sm text-text-secondary dark:text-text-secondary">
                            {lead.email}
                          </div>
                        )}
                        {lead.company && (
                          <div className="text-sm text-text-secondary dark:text-text-secondary">
                            {lead.company}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-primary dark:text-text-secondary">
                      {lead.calculator_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary dark:text-text-inverted">
                          {lead.lead_score}
                        </span>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          lead.lead_quality === 'hot'
                            ? 'bg-danger/10 text-danger dark:bg-danger/90 dark:text-danger'
                            : lead.lead_quality === 'warm'
                            ? 'bg-warning/10 text-warning dark:bg-warning/90 dark:text-warning'
                            : 'bg-border-primary/10 text-text-primary dark:bg-bg-tertiary-dark dark:text-text-secondary'
                        }`}>
                          {lead.lead_quality}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary dark:text-text-secondary">
                      {lead.attribution?.source || 'direct'}
                      {lead.attribution?.campaign && (
                        <div className="text-xs text-text-muted">
                          {lead.attribution.campaign}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex gap-2">
                        {lead.converted && (
                          <span className="inline-flex rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success dark:bg-success/90 dark:text-success">
                            Converted
                          </span>
                        )}
                        {lead.contacted && !lead.converted && (
                          <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-500 dark:bg-blue-500/90 dark:text-blue-500">
                            Contacted
                          </span>
                        )}
                        {!lead.contacted && !lead.converted && (
                          <span className="inline-flex rounded-full bg-border-primary/10 px-2 py-1 text-xs font-semibold text-text-primary dark:bg-bg-tertiary-dark dark:text-text-secondary">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary dark:text-text-secondary">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {leads.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-text-secondary dark:text-text-secondary">
                  No leads found matching the current filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleLeadUpdate}
      />
    </div>
  );
}
