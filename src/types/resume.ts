export interface Resume {
  id: string
  fileName?: string
  candidateName?: string
  name?: string
  email: string
  phone?: string
  experience: number | string
  skills: string[]
  education: string
  score?: number
  overallScore?: number
  jobMatchScore?: number
  tags: string[]
  status: 'processing' | 'completed' | 'exported' | 'new' | 'screening' | 'interview' | 'hired' | 'rejected'
  uploadedAt?: string
  appliedAt?: string
  processedAt?: string
  userId: string
  jobId?: string
  source?: string
  sourcedAt?: string
  stage?: string
  stageUpdatedAt?: string
  location?: string
  resumeUrl?: string
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

export interface ScreeningResult {
  candidateId: string
  overallScore: number
  jobMatchScore: number
  decision: 'accept' | 'reject' | 'review' | 'interview'
  confidence: number
  reasoning: string[]
  nextSteps: string[]
  tags: string[]
  biasFlags: string[]
  culturalFit: number
  growthPotential: number
  processedAt: string
}

export interface PerformanceMetrics {
  totalScreened: number
  accuracyRate: number
  avgProcessingTime: number
  biasScore: number
  hiringSuccessRate: number
}

export interface BiasReport {
  overallBiasScore: number
  genderBias: number
  ageBias: number
  educationBias: number
  recommendations: string[]
  flaggedDecisions: number
}