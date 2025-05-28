'use client'

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, Clock, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface ROIMetrics {
  currentRevenue: number
  currentLeads: number
  conversionRate: number
  avgDealSize: number
  salesCycleWeeks: number
  manualHoursPerWeek: number
  hourlyRate: number
}

interface ROIResults {
  projectedRevenue: number
  revenueIncrease: number
  timeSavings: number
  costSavings: number
  totalROI: number
  paybackMonths: number
}

export function ROICalculator() {
  const [metrics, setMetrics] = useState<ROIMetrics>({
    currentRevenue: 500000,
    currentLeads: 100,
    conversionRate: 15,
    avgDealSize: 5000,
    salesCycleWeeks: 4,
    manualHoursPerWeek: 20,
    hourlyRate: 50,
  })

  const [results, setResults] = useState<ROIResults>({
    projectedRevenue: 0,
    revenueIncrease: 0,
    timeSavings: 0,
    costSavings: 0,
    totalROI: 0,
    paybackMonths: 0,
  })

  const [investmentAmount] = useState(2500) // Average investment for RevOps setup

  useEffect(() => {
    calculateROI()
  }, [metrics])

  const calculateROI = () => {
    const {
      currentRevenue,
      currentLeads,
      conversionRate,
      avgDealSize,
      salesCycleWeeks,
      manualHoursPerWeek,
      hourlyRate,
    } = metrics

    // Revenue calculations with RevOps improvements
    const improvedConversionRate = conversionRate * 1.4 // 40% improvement
    const improvedLeads = currentLeads * 1.25 // 25% more leads through automation
    const improvedSalesCycle = salesCycleWeeks * 0.75 // 25% faster sales cycle

    const currentMonthlyDeals = (currentLeads * (conversionRate / 100)) / (salesCycleWeeks / 4.33)
    const improvedMonthlyDeals = (improvedLeads * (improvedConversionRate / 100)) / (improvedSalesCycle / 4.33)

    const projectedRevenue = improvedMonthlyDeals * avgDealSize * 12
    const revenueIncrease = projectedRevenue - currentRevenue

    // Time and cost savings
    const timeSavingsHours = manualHoursPerWeek * 0.6 * 52 // 60% time savings annually
    const costSavings = timeSavingsHours * hourlyRate

    // Total ROI calculation
    const totalBenefit = revenueIncrease + costSavings
    const totalROI = ((totalBenefit - investmentAmount) / investmentAmount) * 100
    const paybackMonths = investmentAmount / (totalBenefit / 12)

    setResults({
      projectedRevenue,
      revenueIncrease,
      timeSavings: timeSavingsHours,
      costSavings,
      totalROI,
      paybackMonths,
    })
  }

  const handleInputChange = (field: keyof ROIMetrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(Math.round(num))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Your Business Metrics</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Annual Revenue
              </label>
              <input
                type="number"
                value={metrics.currentRevenue}
                onChange={(e) => handleInputChange('currentRevenue', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Leads
              </label>
              <input
                type="number"
                value={metrics.currentLeads}
                onChange={(e) => handleInputChange('currentLeads', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Conversion Rate (%)
              </label>
              <input
                type="number"
                value={metrics.conversionRate}
                onChange={(e) => handleInputChange('conversionRate', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Deal Size
              </label>
              <input
                type="number"
                value={metrics.avgDealSize}
                onChange={(e) => handleInputChange('avgDealSize', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Cycle (Weeks)
              </label>
              <input
                type="number"
                value={metrics.salesCycleWeeks}
                onChange={(e) => handleInputChange('salesCycleWeeks', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manual Sales Work (Hours/Week)
              </label>
              <input
                type="number"
                value={metrics.manualHoursPerWeek}
                onChange={(e) => handleInputChange('manualHoursPerWeek', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Hourly Rate
              </label>
              <input
                type="number"
                value={metrics.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-6">Your ROI Projection</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold">{Math.round(results.totalROI)}%</div>
                <div className="text-blue-100">Total ROI</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{Math.round(results.paybackMonths)}</div>
                <div className="text-blue-100">Months to Payback</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-500">
              <div className="text-sm text-blue-100 mb-2">Annual Revenue Increase</div>
              <div className="text-2xl font-bold">{formatCurrency(results.revenueIncrease)}</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Breakdown</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Revenue Increase</div>
                    <div className="text-sm text-gray-600">40% improvement in conversions</div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(results.revenueIncrease)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Time Savings</div>
                    <div className="text-sm text-gray-600">{formatNumber(results.timeSavings)} hours/year</div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(results.costSavings)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">New Projected Revenue</div>
                    <div className="text-sm text-gray-600">With RevOps optimization</div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-purple-600">
                  {formatCurrency(results.projectedRevenue)}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-8 text-white">
            <h3 className="text-xl font-semibold mb-4">Ready to Achieve These Results?</h3>
            <p className="text-gray-300 mb-6">
              Our revenue operations experts can help you implement the systems and automation 
              needed to achieve these projections for your business.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Schedule Free Consultation
              </Link>
              <Link
                href="/services/revenue-operations"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-600 hover:border-gray-500 text-white font-medium rounded-lg transition-colors"
              >
                Learn About Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">How We Calculate Your ROI</h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Revenue Improvements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 40% increase in conversion rates</li>
              <li>• 25% increase in qualified leads</li>
              <li>• 25% reduction in sales cycle time</li>
              <li>• Better lead scoring and routing</li>
            </ul>
          </div>

          <div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Time Savings</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 60% reduction in manual tasks</li>
              <li>• Automated lead nurturing</li>
              <li>• Streamlined reporting</li>
              <li>• Automated follow-up sequences</li>
            </ul>
          </div>

          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Based on Real Results</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 10+ years enterprise experience</li>
              <li>• 50+ successful implementations</li>
              <li>• Average 40% revenue increase</li>
              <li>• 6-month average payback period</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}