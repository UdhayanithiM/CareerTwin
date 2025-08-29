'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  Users,
  Settings,
  Search,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Filter,
  Download,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FiUsers, FiActivity } from 'react-icons/fi';
import { ModeToggle } from '@/components/mode-toggle';

// --- Types ---
type Candidate = {
  id: number;
  name: string;
  department: string;
  status: string;
  score: string; // e.g. '88%' or '-'
  date: string; // ISO date string
};

// --- Sample data ---
const sampleCandidates: Candidate[] = [
  { id: 1, name: 'Liam Johnson', department: 'Engineering', status: 'Completed', score: '88%', date: '2023-07-15' },
  { id: 2, name: 'Olivia Smith', department: 'Marketing', status: 'Pending', score: '-', date: '2023-08-01' },
  { id: 3, name: 'Noah Williams', department: 'Sales', status: 'In Progress', score: '-', date: '2023-08-05' },
  { id: 4, name: 'Emma Davis', department: 'Engineering', status: 'Completed', score: '92%', date: '2023-07-20' },
  { id: 5, name: 'James Brown', department: 'Product', status: 'Completed', score: '78%', date: '2023-07-22' },
  { id: 6, name: 'Sophia Wilson', department: 'Human Resources', status: 'Pending', score: '-', date: '2023-08-10' },
  { id: 7, name: 'Lucas Garcia', department: 'Engineering', status: 'Completed', score: '85%', date: '2023-07-18' },
  { id: 8, name: 'Mia Martinez', department: 'Marketing', status: 'Completed', score: '79%', date: '2023-07-25' },
  { id: 9, name: 'Ethan Anderson', department: 'Sales', status: 'In Progress', score: '-', date: '2023-08-08' },
  { id: 10, name: 'Ava Taylor', department: 'Product', status: 'Pending', score: '-', date: '2023-08-15' },
  { id: 11, name: 'Benjamin Moore', department: 'Engineering', status: 'Completed', score: '90%', date: '2023-07-19' },
  { id: 12, name: 'Isabella White', department: 'Human Resources', status: 'Completed', score: '82%', date: '2023-07-23' },
];

const departments = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'Product', 'Human Resources'];
const statuses = ['All Statuses', 'Completed', 'In Progress', 'Pending'];

// Chart data
const scoreDistributionData = [
  { name: 'Engineering', '90100': 12, '8089': 18, '7079': 8, '6069': 3, below60: 1 },
  { name: 'Marketing', '90100': 8, '8089': 14, '7079': 10, '6069': 4, below60: 2 },
  { name: 'Sales', '90100': 6, '8089': 12, '7079': 14, '6069': 5, below60: 3 },
  { name: 'Product', '90100': 10, '8089': 15, '7079': 9, '6069': 4, below60: 1 },
  { name: 'Human Resources', '90100': 7, '8089': 13, '7079': 8, '6069': 3, below60: 1 },
];

const participationData = [
  { name: 'Invited', value: 120 },
  { name: 'Started', value: 95 },
  { name: 'Completed', value: 78 },
  { name: 'Passed', value: 62 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function HrDashboardUpgraded() {
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates'>('overview');
  const [query, setQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortColumn, setSortColumn] = useState<keyof Candidate>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // We don't update the sample data in this component, so omit the setter to avoid unused variable warnings
  const [candidatesData] = useState<Candidate[]>(sampleCandidates);

  // Helper to safely parse score values
  const parseScore = (s: unknown): number => {
    if (typeof s === 'string') {
      if (s.endsWith('%')) return parseInt(s.replace('%', ''), 10);
      if (s === '-') return -1;
      const n = parseInt(s, 10);
      return Number.isNaN(n) ? -1 : n;
    }
    if (typeof s === 'number') return s;
    return -1;
  };

  // Derived / memoized filtered + sorted list
  const filteredCandidates = useMemo(() => {
    let list: Candidate[] = [...candidatesData];

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.department.toLowerCase().includes(q));
    }

    // Department
    if (selectedDepartment !== 'All Departments') {
      list = list.filter((c) => c.department === selectedDepartment);
    }

    // Status
    if (selectedStatus !== 'All Statuses') {
      list = list.filter((c) => c.status === selectedStatus);
    }

    // Date range
    if (dateRange.from) {
      const from = new Date(dateRange.from);
      list = list.filter((c) => new Date(c.date) >= from);
    }
    if (dateRange.to) {
      const to = new Date(dateRange.to);
      list = list.filter((c) => new Date(c.date) <= to);
    }

    // Sorting with type-awareness
    list.sort((a: Candidate, b: Candidate) => {
      const aRaw = a[sortColumn];
      const bRaw = b[sortColumn];

      let aVal: number | string = '';
      let bVal: number | string = '';

      if (sortColumn === 'score') {
        aVal = parseScore(aRaw as unknown);
        bVal = parseScore(bRaw as unknown);
      } else if (sortColumn === 'date') {
        aVal = new Date(String(aRaw)).getTime();
        bVal = new Date(String(bRaw)).getTime();
      } else {
        aVal = String(aRaw).toLowerCase();
        bVal = String(bRaw).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [candidatesData, query, selectedDepartment, selectedStatus, dateRange, sortColumn, sortDirection]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(filteredCandidates.length, startIndex + itemsPerPage);
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  useEffect(() => {
    // reset to page 1 when filters change
    setCurrentPage(1);
  }, [query, selectedDepartment, selectedStatus, dateRange, itemsPerPage]);

  // Derived stats
  const totalCandidates = candidatesData.length;
  const completedCandidates = candidatesData.filter((c) => c.status === 'Completed').length;
  const completionRate = Math.round((completedCandidates / Math.max(1, totalCandidates)) * 100);
  const candidatesWithScores = candidatesData.filter((c) => c.score !== '-');
  const averageScore = Math.round(
    candidatesWithScores.reduce((acc, cur) => acc + parseInt(String(cur.score).replace('%', '') || '0', 10), 0) / Math.max(1, candidatesWithScores.length)
  );

  // UI helpers
  const toggleSort = (column: keyof Candidate) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
   * Corrected: This function handles the tab change event.
   * It receives a 'string' and validates it before calling setActiveTab,
   * which resolves the TypeScript type mismatch.
   */
  const handleTabChange = (value: string) => {
    if (value === 'overview' || value === 'candidates') {
      setActiveTab(value as 'overview' | 'candidates');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Department', 'Status', 'Score', 'Applied Date'],
      ...filteredCandidates.map((c) => [c.id, c.name, c.department, c.status, c.score, c.date]),
    ];
    const csvContent = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset filters
  const resetFilters = () => {
    setQuery('');
    setSelectedDepartment('All Departments');
    setSelectedStatus('All Statuses');
    setDateRange({ from: '', to: '' });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-card fixed inset-y-0">
        <div className="p-5 border-b">
          <h2 className="font-extrabold text-2xl">
            <span className="text-primary">Forti</span>Twin
          </h2>
          <p className="text-xs text-muted-foreground mt-1">HR Dashboard — upgraded UI</p>
        </div>

        <nav className="p-4 space-y-6 flex-1 overflow-auto">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground tracking-wider">MAIN</h3>
            <div className="mt-2 space-y-1">
              <button
                className={cn(
                  'flex items-center px-3 py-2 text-sm rounded-md font-medium w-full text-left',
                  activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted transition-colors'
                )}
                onClick={() => setActiveTab('overview')}
                aria-current={activeTab === 'overview' ? 'page' : undefined}
              >
                <BarChart3 className="h-4 w-4 mr-3 flex-shrink-0" />
                Analytics
              </button>

              <button
                className={cn(
                  'flex items-center px-3 py-2 text-sm rounded-md font-medium w-full text-left',
                  activeTab === 'candidates' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted transition-colors'
                )}
                onClick={() => setActiveTab('candidates')}
              >
                <Users className="h-4 w-4 mr-3 flex-shrink-0" />
                Candidates
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground tracking-wider">SETTINGS</h3>
            <div className="mt-2 space-y-1">
              <button
                className="flex items-center px-3 py-2 text-sm rounded-md font-medium text-foreground hover:bg-muted transition-colors w-full text-left"
                onClick={() => alert('Open preferences')}
              >
                <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                Preferences
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t">
          <Card className="bg-primary/10 border-none">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm">Need Help?</h4>
              <p className="text-xs text-muted-foreground mt-1">Check docs and onboarding guides</p>
              <Button variant="link" size="sm" className="px-0 mt-2 h-auto text-primary">
                View Documentation
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 border-b z-30 bg-background h-14 flex items-center px-4">
        <Button variant="outline" size="icon" className="mr-3">
          <Users className="h-5 w-5" />
        </Button>
        <h2 className="font-bold">
          <span className="text-primary">Forti</span>Twin
        </h2>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 md:ml-72">
        <div className="p-6 md:pt-8 md:px-8 pb-16 max-w-7xl mx-auto">
          {/* Header + controls */}
          <div className="flex flex-col md:flex-row md:items-center mb-6 md:mb-8 justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">HR Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">Monitor hiring processes and candidate performance</p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <ModeToggle />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    className="pl-10 md:w-[300px] h-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search candidates"
                  />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium">Department</label>
                      <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Status</label>
                      <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium">From</label>
                        <Input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">To</label>
                        <Input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="flex-1" onClick={resetFilters}>
                        Reset
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => { setActiveTab('candidates'); }}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="h-10" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-28 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCandidates}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tests Sent</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCandidates}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +5.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore}%</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +3.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs + charts */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsContent value="overview" className="mt-0 p-0">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-6">
                <Card className="xl:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Test Score Distribution</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('View details clicked')}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Download data clicked')}>Download Data</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>Distribution of candidate scores across departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistributionData} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip
                            formatter={(value, name) => {
                              const labels = {
                                '90100': '90-100%',
                                '8089': '80-89%',
                                '7079': '70-79%',
                                '6069': '60-69%',
                                below60: 'Below 60%',
                              };
                              return [`${value} candidates`, labels[name as keyof typeof labels] || name];
                            }}
                          />
                          <Legend
                            formatter={(value) => {
                              const labels = {
                                '90100': '90-100%',
                                '8089': '80-89%',
                                '7079': '70-79%',
                                '6069': '60-69%',
                                below60: 'Below 60%',
                              };
                              return labels[value as keyof typeof labels] || value;
                            }}
                          />
                          <Bar dataKey="90100" stackId="a" fill="#10B981" />
                          <Bar dataKey="8089" stackId="a" fill="#6366F1" />
                          <Bar dataKey="7079" stackId="a" fill="#FBBF24" />
                          <Bar dataKey="6069" stackId="a" fill="#F59E0B" />
                          <Bar dataKey="below60" stackId="a" fill="#EF4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Participation Metrics</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('View details clicked')}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Download data clicked')}>Download Data</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>Candidates progress overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={participationData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                            {participationData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} candidates`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-100 mr-3">
                          <FiUsers className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Completion Rate</p>
                          <p className="text-xl font-bold text-blue-600">{Math.round((participationData[2].value / participationData[0].value) * 100)}%</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-green-100 mr-3">
                          <FiActivity className="text-green-600" size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pass Rate</p>
                          <p className="text-xl font-bold text-green-600">{Math.round((participationData[3].value / participationData[2].value) * 100)}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="candidates"></TabsContent>
          </Tabs>

          {/* Candidates table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{activeTab === 'candidates' ? 'All Candidates' : 'Recent Candidates'}</CardTitle>
                  <CardDescription>
                    {activeTab === 'candidates' ? 'Manage and track all candidate assessments' : 'Latest candidate assessments and results'}
                  </CardDescription>
                </div>

                {activeTab !== 'candidates' && (
                  <Button variant="outline" size="sm" className="sm:w-auto w-full" onClick={() => setActiveTab('candidates')}>
                    View All Candidates
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                        <div className="flex items-center">Name{sortColumn === 'name' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('department')}>
                        <div className="flex items-center">Department{sortColumn === 'department' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                        <div className="flex items-center">Status{sortColumn === 'status' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('score')}>
                        <div className="flex items-center">Score{sortColumn === 'score' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                        <div className="flex items-center">Applied{sortColumn === 'date' && (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}</div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {currentCandidates.length > 0 ? (
                      currentCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell>{candidate.department}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                candidate.status === 'Completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : candidate.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              )}
                            >
                              {candidate.status}
                            </span>
                          </TableCell>
                          <TableCell>{candidate.score}</TableCell>
                          <TableCell>{candidate.date}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => alert(`View profile for ${candidate.name}`)}>View Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`View results for ${candidate.name}`)}>View Results</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => alert(`Sending message to ${candidate.name}`)}>Send Message</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No candidates match your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredCandidates.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{filteredCandidates.length}</span> candidates
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>

                    <div className="flex items-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" className="w-8 h-8" onClick={() => setCurrentPage(page)}>
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}