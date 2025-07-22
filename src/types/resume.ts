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
  jobMatchScore?: number // Job-specific match score
}

export interface ProcessingJob {
  id: string
  fileName: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  uploadedAt: string
}

export interface KekaCandidate {
  name: string
  email: string
  phone?: string
  skills: string[]
  experience: number
  education: string
  resumeUrl: string
}