export interface JobRequirement {
  id: string
  title: string
  department: string
  location: string
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead'
  requiredSkills: string[]
  preferredSkills: string[]
  education: string[]
  description: string
  responsibilities: string[]
  qualifications: string[]
  intakeDocument?: string // File path or content
  createdAt: string
  updatedAt: string
  userId: string
  isActive: boolean
}

export interface JobScreeningCriteria {
  skillsWeight: number // 0-100
  experienceWeight: number // 0-100
  educationWeight: number // 0-100
  keywordsWeight: number // 0-100
  minimumScore: number // 0-100
  mustHaveSkills: string[]
  dealBreakerKeywords: string[]
}

export interface JobBasedResume extends Resume {
  jobId: string
  jobTitle: string
  jobMatchScore: number
  skillsMatch: {
    matched: string[]
    missing: string[]
    additional: string[]
  }
  experienceMatch: boolean
  educationMatch: boolean
  keywordMatches: string[]
}

// Extend the existing Resume interface
export interface Resume {
  id: string
  fileName: string
  candidateName: string
  email: string
  phone?: string
  experience: number
  skills: string[]
  education: string
  score: number
  tags: string[]
  status: 'processing' | 'completed' | 'exported'
  uploadedAt: string
  processedAt?: string
  userId: string
  jobId?: string // Link to specific job
  jobMatchScore?: number
}