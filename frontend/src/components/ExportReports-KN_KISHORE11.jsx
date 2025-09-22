import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  Filter
} from 'lucide-react'

const ExportReports = ({ complaints = [], onExport }) => {
  const [exportFormat, setExportFormat] = useState('csv')
  const [reportType, setReportType] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  const generateCSV = (data) => {
    const headers = ['ID', 'Title', 'Description', 'Category', 'Severity', 'Status', 'Location', 'Created Date', 'User ID']
    const csvContent = [
      headers.join(','),
      ...data.map(complaint => [
        complaint.id,
        `"${complaint.title.replace(/"/g, '""')}"`,
        `"${complaint.description.replace(/"/g, '""')}"`,
        complaint.category,
        complaint.severity,
        complaint.status,
        `"${complaint.location.replace(/"/g, '""')}"`,
        new Date(complaint.createdAt).toLocaleDateString(),
        typeof complaint.userId === 'object' ? (complaint.userId.id || complaint.userId._id || 'Unknown') : complaint.userId
      ].join(','))
    ].join('\n')
    
    return csvContent
  }

  const generateJSON = (data) => {
    return JSON.stringify(data, null, 2)
  }

  const generateSummaryReport = (data) => {
    const summary = {
      totalComplaints: data.length,
      byStatus: data.reduce((acc, complaint) => {
        acc[complaint.status] = (acc[complaint.status] || 0) + 1
        return acc
      }, {}),
      bySeverity: data.reduce((acc, complaint) => {
        acc[complaint.severity] = (acc[complaint.severity] || 0) + 1
        return acc
      }, {}),
      byCategory: data.reduce((acc, complaint) => {
        acc[complaint.category] = (acc[complaint.category] || 0) + 1
        return acc
      }, {}),
      generatedAt: new Date().toISOString()
    }
    
    return JSON.stringify(summary, null, 2)
  }

  const filterComplaintsByDate = (complaints, range) => {
    if (range === 'all') return complaints
    
    const now = new Date()
    const filterDate = new Date()
    
    switch (range) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3)
        break
      default:
        return complaints
    }
    
    return complaints.filter(complaint => 
      new Date(complaint.createdAt) >= filterDate
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      let filteredComplaints = filterComplaintsByDate(complaints, dateRange)
      
      if (reportType !== 'all') {
        filteredComplaints = filteredComplaints.filter(complaint => 
          complaint.status.toLowerCase() === reportType
        )
      }
      
      let content = ''
      let filename = ''
      let mimeType = ''
      
      switch (exportFormat) {
        case 'csv':
          content = generateCSV(filteredComplaints)
          filename = `complaints_report_${Date.now()}.csv`
          mimeType = 'text/csv'
          break
        case 'json':
          content = generateJSON(filteredComplaints)
          filename = `complaints_report_${Date.now()}.json`
          mimeType = 'application/json'
          break
        case 'summary':
          content = generateSummaryReport(filteredComplaints)
          filename = `complaints_summary_${Date.now()}.json`
          mimeType = 'application/json'
          break
        default:
          throw new Error('Invalid export format')
      }
      
      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Show success notification
      if (window.showNotification) {
        window.showNotification('success', 'Export Successful', `Report exported as ${filename}`)
      }
      
      if (onExport) {
        onExport({ format: exportFormat, type: reportType, dateRange, count: filteredComplaints.length })
      }
      
    } catch (error) {
      console.error('Export failed:', error)
      if (window.showNotification) {
        window.showNotification('error', 'Export Failed', 'There was an error generating the report')
      }
    } finally {
      setIsExporting(false)
    }
  }

  const getFilteredCount = () => {
    let filtered = filterComplaintsByDate(complaints, dateRange)
    if (reportType !== 'all') {
      filtered = filtered.filter(complaint => 
        complaint.status.toLowerCase() === reportType
      )
    }
    return filtered.length
  }

  return (
    <Card className="glass border-white/20">
      <CardHeader>
        <CardTitle className="text-civic-dark flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Export Reports
        </CardTitle>
        <CardDescription>
          Generate and download complaint reports in various formats
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-civic-dark mb-2">
              Report Type
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Complaints</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="in progress">In Progress Only</SelectItem>
                <SelectItem value="resolved">Resolved Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-civic-dark mb-2">
              Date Range
            </label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-civic-dark mb-2">
              Export Format
            </label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="json">JSON (Data)</SelectItem>
                <SelectItem value="summary">Summary Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center text-sm text-civic-text">
            <Filter className="h-4 w-4 mr-1" />
            <span>{getFilteredCount()} complaints will be exported</span>
          </div>
          
          <Button 
            onClick={handleExport}
            disabled={isExporting || complaints.length === 0}
            className="bg-civic-accent hover:bg-civic-accent/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
        
        <div className="text-xs text-civic-text/70 space-y-1">
          <p><strong>CSV:</strong> Suitable for Excel and spreadsheet applications</p>
          <p><strong>JSON:</strong> Raw data format for technical analysis</p>
          <p><strong>Summary:</strong> Statistical overview with counts and metrics</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExportReports