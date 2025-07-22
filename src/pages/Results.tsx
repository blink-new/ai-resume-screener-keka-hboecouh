import { useState, useMemo, useEffect } from 'react'
import { ResumeCard } from '@/components/results/ResumeCard'
import { FilterPanel, ResumeFilters } from '@/components/results/FilterPanel'
import { Resume } from '@/types/resume'
import { JobRequirement } from '@/types/job'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, Filter, Briefcase, Target, TrendingUp, Loader2 } from 'lucide-react'
import { blink } from '@/blink/client'

export function Results() {
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('score')
  const [selectedJobId, setSelectedJobId] = useState<string>('all')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [jobs, setJobs] = useState<JobRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ResumeFilters>({
    search: '',
    minScore: 0,
    maxScore: 100,
    minExperience: 0,
    maxExperience: 20,
    skills: [],
    tags: [],
    education: 'all',
    status: 'all'
  })

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load jobs
        const jobsData = await blink.db.jobs.list({
          where: { isActive: "1" },
          orderBy: { createdAt: 'desc' }
        })
        
        const formattedJobs: JobRequirement[] = jobsData.map(job => ({
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location || '',
          experienceLevel: job.experienceLevel as 'junior' | 'mid' | 'senior' | 'lead' | 'executive',
          requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
          preferredSkills: job.preferredSkills ? JSON.parse(job.preferredSkills) : [],
          education: job.education ? JSON.parse(job.education) : [],
          description: job.description || '',
          responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
          qualifications: job.qualifications ? JSON.parse(job.qualifications) : [],
          intakeDocument: job.intakeDocument,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          userId: job.userId,
          isActive: Number(job.isActive) > 0
        }))
        
        setJobs(formattedJobs)
        
        // Load resumes
        const resumesData = await blink.db.resumes.list({
          orderBy: { createdAt: 'desc' }
        })
        
        const formattedResumes: Resume[] = resumesData.map(resume => ({
          id: resume.id,
          fileName: resume.fileName,
          candidateName: resume.candidateName || 'Unknown',
          email: resume.candidateEmail || '',
          phone: resume.candidatePhone || '',
          experience: resume.experienceYears || 0,
          skills: resume.skills ? JSON.parse(resume.skills) : [],
          education: resume.education ? JSON.parse(resume.education)[0] || '' : '',
          score: Math.round((resume.relevanceScore || 0) * 100),
          tags: resume.tags ? JSON.parse(resume.tags) : [],
          status: 'completed',
          uploadedAt: resume.createdAt,
          processedAt: resume.processedAt || resume.createdAt,
          userId: resume.userId,
          jobId: resume.jobId,
          jobMatchScore: Math.round((resume.relevanceScore || 0) * 100)
        }))
        
        setResumes(formattedResumes)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const selectedJob = jobs.find(job => job.id === selectedJobId)

  // Extract available skills and tags for filters
  const availableSkills = useMemo(() => {
    const skills = new Set<string>()
    resumes.forEach(resume => {
      resume.skills.forEach(skill => skills.add(skill))
    })
    return Array.from(skills).sort()
  }, [resumes])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    resumes.forEach(resume => {
      resume.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [resumes])

  // Filter and sort resumes
  const filteredResumes = useMemo(() => {
    let filtered = resumes

    // Job filter
    if (selectedJobId && selectedJobId !== 'all') {
      filtered = filtered.filter(resume => resume.jobId === selectedJobId)
    }

    filtered = filtered.filter(resume => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          resume.candidateName.toLowerCase().includes(searchLower) ||
          resume.email.toLowerCase().includes(searchLower) ||
          resume.skills.some(skill => skill.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      // Score filter
      if (resume.score < filters.minScore || resume.score > filters.maxScore) {
        return false
      }

      // Experience filter
      if (resume.experience < filters.minExperience || resume.experience > filters.maxExperience) {
        return false
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const hasRequiredSkills = filters.skills.every(skill => 
          resume.skills.includes(skill)
        )
        if (!hasRequiredSkills) return false
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.every(tag => 
          resume.tags.includes(tag)
        )
        if (!hasRequiredTags) return false
      }

      // Education filter
      if (filters.education && filters.education !== 'all' && resume.education !== filters.education) {
        return false
      }

      // Status filter
      if (filters.status && filters.status !== 'all' && resume.status !== filters.status) {
        return false
      }

      return true
    })

    // Sort resumes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'experience':
          return b.experience - a.experience
        case 'name':
          return a.candidateName.localeCompare(b.candidateName)
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [filters, sortBy, resumes, selectedJobId])

  const handleExportToKeka = (resume: Resume) => {
    // In real app, this would call Keka API
    console.log('Exporting to Keka:', resume)
    alert(`Exporting ${resume.candidateName} to Keka ATS...`)
  }

  const handleViewDetails = (resume: Resume) => {
    // In real app, this would open a detailed view
    console.log('Viewing details:', resume)
    alert(`Viewing details for ${resume.candidateName}`)
  }

  const exportAllQualified = () => {
    const qualified = filteredResumes.filter(r => r.score >= 80 && r.status === 'completed')
    console.log('Exporting all qualified candidates:', qualified)
    alert(`Exporting ${qualified.length} qualified candidates to Keka ATS...`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading screening results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Screening Results</h1>
          <p className="text-gray-600 mt-2">
            {filteredResumes.length} candidates found
            {selectedJob && ` for ${selectedJob.title}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button onClick={exportAllQualified} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export Qualified to Keka
          </Button>
        </div>
      </div>

      {/* Job Selection and Stats */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Job Filter */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Filter by Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {jobs.filter(job => job.isActive).map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedJob && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{selectedJob.department}</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Required Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedJob.requiredSkills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {selectedJob.requiredSkills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedJob.requiredSkills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-3 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredResumes.length > 0 
                      ? Math.round(filteredResumes.reduce((sum, r) => sum + r.score, 0) / filteredResumes.length)
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualified (80+)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredResumes.filter(r => r.score >= 80).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Exported</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredResumes.filter(r => r.status === 'exported').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Score (High to Low)</SelectItem>
            <SelectItem value="experience">Experience</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="date">Upload Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {(filters.skills.length > 0 || filters.tags.length > 0 || (filters.education && filters.education !== 'all') || (filters.status && filters.status !== 'all')) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.skills.map(skill => (
            <Badge key={skill} variant="secondary">
              Skill: {skill}
            </Badge>
          ))}
          {filters.tags.map(tag => (
            <Badge key={tag} variant="outline">
              Tag: {tag}
            </Badge>
          ))}
          {filters.education && filters.education !== 'all' && (
            <Badge variant="secondary">
              Education: {filters.education}
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary">
              Status: {filters.status}
            </Badge>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <FilterPanel
              onFiltersChange={setFilters}
              availableSkills={availableSkills}
              availableTags={availableTags}
            />
          </div>
        )}

        {/* Results Grid */}
        <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {filteredResumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No candidates found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onExportToKeka={handleExportToKeka}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}