import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  ExternalLink,
  MessageSquare,
  UserPlus
} from 'lucide-react'

interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  score: number
  experience: number
  skills: string[]
  education: string
  currentRole?: string
  company?: string
  tags: string[]
  status: 'new' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected'
  appliedDate: string
  lastActivity: string
  notes?: string
  resumeUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  salary?: {
    current?: number
    expected?: number
  }
}

export function Candidates() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  // Mock candidate data
  const candidates: Candidate[] = useMemo(() => [
    {
      id: '1',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 (555) 456-7890',
      location: 'San Francisco, CA',
      score: 95,
      experience: 12,
      skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Leadership'],
      education: "Master's in Computer Science",
      currentRole: 'Senior Software Architect',
      company: 'TechCorp Inc.',
      tags: ['Senior Architect', 'Team Lead', 'Enterprise'],
      status: 'shortlisted',
      appliedDate: '2024-01-18',
      lastActivity: '2024-01-20',
      notes: 'Excellent technical background, strong leadership experience',
      linkedinUrl: 'https://linkedin.com/in/sarahwilson',
      salary: { current: 180000, expected: 200000 }
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      score: 92,
      experience: 5,
      skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'MongoDB'],
      education: "Bachelor's in Computer Science",
      currentRole: 'Full Stack Developer',
      company: 'StartupXYZ',
      tags: ['Senior Developer', 'Full Stack', 'Remote Ready'],
      status: 'reviewed',
      appliedDate: '2024-01-19',
      lastActivity: '2024-01-20',
      notes: 'Strong full-stack skills, good cultural fit',
      portfolioUrl: 'https://johndoe.dev',
      salary: { current: 120000, expected: 140000 }
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 (555) 987-6543',
      location: 'Austin, TX',
      score: 88,
      experience: 8,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
      education: "Master's in Software Engineering",
      currentRole: 'Backend Engineer',
      company: 'DataFlow Systems',
      tags: ['Backend Expert', 'DevOps', 'Team Lead'],
      status: 'interviewed',
      appliedDate: '2024-01-17',
      lastActivity: '2024-01-19',
      notes: 'Excellent backend skills, DevOps experience is a plus',
      linkedinUrl: 'https://linkedin.com/in/janesmith',
      salary: { current: 140000, expected: 160000 }
    },
    {
      id: '4',
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      location: 'Seattle, WA',
      score: 75,
      experience: 3,
      skills: ['React', 'TypeScript', 'CSS', 'Figma'],
      education: "Bachelor's in Design",
      currentRole: 'Frontend Developer',
      company: 'DesignStudio',
      tags: ['Frontend', 'UI/UX', 'Junior'],
      status: 'new',
      appliedDate: '2024-01-20',
      lastActivity: '2024-01-20',
      portfolioUrl: 'https://mikejohnson.design',
      salary: { expected: 85000 }
    },
    {
      id: '5',
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+1 (555) 234-5678',
      location: 'Los Angeles, CA',
      score: 89,
      experience: 6,
      skills: ['React Native', 'iOS', 'Android', 'JavaScript', 'Swift'],
      education: "Bachelor's in Computer Science",
      currentRole: 'Mobile Developer',
      company: 'MobileFirst',
      tags: ['Mobile Expert', 'Cross Platform', 'Senior'],
      status: 'hired',
      appliedDate: '2024-01-15',
      lastActivity: '2024-01-18',
      notes: 'Hired for Senior Mobile Developer position',
      linkedinUrl: 'https://linkedin.com/in/emilychen',
      salary: { current: 130000, expected: 150000 }
    }
  ], [])

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = searchTerm === '' || 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'high-score' && candidate.score >= 85) ||
        (activeTab === 'recent' && new Date(candidate.appliedDate) > new Date('2024-01-18'))

      return matchesSearch && matchesStatus && matchesTab
    })
  }, [candidates, searchTerm, statusFilter, activeTab])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted': return 'bg-purple-100 text-purple-800'
      case 'interviewed': return 'bg-orange-100 text-orange-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const statusCounts = useMemo(() => {
    return candidates.reduce((acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [candidates])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your candidate pipeline
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { status: 'new', label: 'New', icon: UserPlus },
          { status: 'reviewed', label: 'Reviewed', icon: Eye },
          { status: 'shortlisted', label: 'Shortlisted', icon: Star },
          { status: 'interviewed', label: 'Interviewed', icon: MessageSquare },
          { status: 'hired', label: 'Hired', icon: Award },
          { status: 'rejected', label: 'Rejected', icon: ExternalLink }
        ].map(({ status, label, icon: Icon }) => (
          <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
                </div>
                <Icon className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Candidates ({candidates.length})</TabsTrigger>
          <TabsTrigger value="high-score">High Score ({candidates.filter(c => c.score >= 85).length})</TabsTrigger>
          <TabsTrigger value="recent">Recent ({candidates.filter(c => new Date(c.appliedDate) > new Date('2024-01-18')).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Candidates List */}
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidate.name}
                          </h3>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className={`h-4 w-4 ${getScoreColor(candidate.score)}`} />
                            <span className={`font-semibold ${getScoreColor(candidate.score)}`}>
                              {candidate.score}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {candidate.email}
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {candidate.phone}
                            </div>
                          )}
                          {candidate.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {candidate.location}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {candidate.experience} years exp.
                          </div>
                        </div>
                        
                        {candidate.currentRole && candidate.company && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">{candidate.currentRole}</span> at {candidate.company}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3">
                          {candidate.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Candidate Profile</DialogTitle>
                          </DialogHeader>
                          {selectedCandidate && (
                            <div className="space-y-6">
                              {/* Header */}
                              <div className="flex items-start gap-6">
                                <Avatar className="h-20 w-20">
                                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xl">
                                    {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {selectedCandidate.name}
                                  </h2>
                                  <div className="grid gap-2 md:grid-cols-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      {selectedCandidate.email}
                                    </div>
                                    {selectedCandidate.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {selectedCandidate.phone}
                                      </div>
                                    )}
                                    {selectedCandidate.location && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {selectedCandidate.location}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Applied {new Date(selectedCandidate.appliedDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className={`h-5 w-5 ${getScoreColor(selectedCandidate.score)}`} />
                                    <span className={`text-2xl font-bold ${getScoreColor(selectedCandidate.score)}`}>
                                      {selectedCandidate.score}
                                    </span>
                                  </div>
                                  <Badge className={getStatusColor(selectedCandidate.status)}>
                                    {selectedCandidate.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <Briefcase className="h-5 w-5" />
                                      Experience
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      <div>
                                        <p className="font-semibold">{selectedCandidate.currentRole}</p>
                                        <p className="text-gray-600">{selectedCandidate.company}</p>
                                        <p className="text-sm text-gray-500">{selectedCandidate.experience} years experience</p>
                                      </div>
                                      {selectedCandidate.salary && (
                                        <div className="pt-3 border-t">
                                          <p className="text-sm text-gray-600">
                                            {selectedCandidate.salary.current && (
                                              <span>Current: ${selectedCandidate.salary.current.toLocaleString()}</span>
                                            )}
                                            {selectedCandidate.salary.current && selectedCandidate.salary.expected && ' • '}
                                            {selectedCandidate.salary.expected && (
                                              <span>Expected: ${selectedCandidate.salary.expected.toLocaleString()}</span>
                                            )}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <GraduationCap className="h-5 w-5" />
                                      Education
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p>{selectedCandidate.education}</p>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle>Skills</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedCandidate.skills.map((skill) => (
                                        <Badge key={skill} variant="outline">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle>Tags</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedCandidate.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Links */}
                              {(selectedCandidate.linkedinUrl || selectedCandidate.portfolioUrl) && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Links</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex gap-4">
                                      {selectedCandidate.linkedinUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                          <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            LinkedIn
                                          </a>
                                        </Button>
                                      )}
                                      {selectedCandidate.portfolioUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                          <a href={selectedCandidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Portfolio
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Notes */}
                              {selectedCandidate.notes && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-gray-700">{selectedCandidate.notes}</p>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export to Keka
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No candidates found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}