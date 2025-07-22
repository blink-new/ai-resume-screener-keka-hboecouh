import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Star,
  ExternalLink,
  Download,
  Target
} from 'lucide-react'
import { Resume } from '@/types/resume'

interface ResumeCardProps {
  resume: Resume
  onExportToKeka: (resume: Resume) => void
  onViewDetails: (resume: Resume) => void
}

export function ResumeCard({ resume, onExportToKeka, onViewDetails }: ResumeCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStatusColor = (status: Resume['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'exported':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{resume.candidateName}</h3>
              <p className="text-sm text-gray-500">{resume.fileName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(resume.score)}`}>
              <Star className="h-3 w-3 inline mr-1" />
              {resume.score}%
            </div>
            {resume.jobMatchScore && (
              <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                <Target className="h-3 w-3 inline mr-1" />
                {resume.jobMatchScore}% match
              </div>
            )}
            <Badge className={getStatusColor(resume.status)}>
              {resume.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{resume.email}</span>
          </div>
          
          {resume.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{resume.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="h-4 w-4" />
            <span>{resume.experience} years experience</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <GraduationCap className="h-4 w-4" />
            <span>{resume.education}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {resume.skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {resume.skills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{resume.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
          <div className="flex flex-wrap gap-1">
            {resume.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(resume)}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {resume.status === 'completed' && (
            <Button 
              size="sm" 
              onClick={() => onExportToKeka(resume)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Keka
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}