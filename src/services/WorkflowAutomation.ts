import { createClient } from '@blinkdotnew/sdk'
import type { Resume, Job, ScreeningResult } from '../types/resume'

const blink = createClient({
  projectId: 'ai-resume-screener-keka-hboecouh',
  authRequired: true
})

export interface AutomationRule {
  id: string
  name: string
  trigger: 'candidate_screened' | 'score_threshold' | 'time_based' | 'bulk_complete'
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive: boolean
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface AutomationAction {
  type: 'email' | 'keka_update' | 'schedule_interview' | 'add_tag' | 'move_stage'
  parameters: Record<string, any>
}

export interface CandidateSource {
  name: string
  type: 'job_board' | 'linkedin' | 'referral' | 'direct_application'
  apiEndpoint?: string
  credentials?: Record<string, string>
  isActive: boolean
}

/**
 * Phase 3: Workflow Automation Engine
 */
export class WorkflowAutomation {
  private automationRules: AutomationRule[] = []
  private candidateSources: CandidateSource[] = []

  constructor() {
    this.initializeDefaultRules()
    this.initializeDefaultSources()
  }

  /**
   * Automated candidate sourcing from multiple channels
   */
  async autoSourceCandidates(jobId: string, targetCount: number = 50): Promise<Resume[]> {
    console.log(`🔄 Auto-sourcing ${targetCount} candidates for job ${jobId}`)
    
    const job = await this.getJobDetails(jobId)
    const sourcedCandidates: Resume[] = []

    for (const source of this.candidateSources.filter(s => s.isActive)) {
      try {
        const candidates = await this.sourceFromChannel(source, job, Math.ceil(targetCount / this.candidateSources.length))
        sourcedCandidates.push(...candidates)
        
        console.log(`✅ Sourced ${candidates.length} candidates from ${source.name}`)
      } catch (error) {
        console.error(`❌ Error sourcing from ${source.name}:`, error)
      }
    }

    // Store sourced candidates
    await this.storeCandidates(sourcedCandidates, jobId)
    
    return sourcedCandidates.slice(0, targetCount)
  }

  private async sourceFromChannel(source: CandidateSource, job: Job, count: number): Promise<Resume[]> {
    // Mock implementation - in production would integrate with actual APIs
    const mockCandidates: Resume[] = []
    
    for (let i = 0; i < count; i++) {
      const candidate: Resume = {
        id: `sourced_${Date.now()}_${i}`,
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@example.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        skills: this.generateRelevantSkills(job),
        experience: `${Math.floor(Math.random() * 10) + 1} years`,
        education: ['Bachelor\'s Degree', 'Master\'s Degree'][Math.floor(Math.random() * 2)],
        location: 'Remote',
        source: source.name,
        appliedAt: new Date().toISOString(),
        userId: (await blink.auth.me()).id
      }
      
      mockCandidates.push(candidate)
    }

    return mockCandidates
  }

  private generateRelevantSkills(job: Job): string[] {
    const skillPool = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
      'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis',
      'GraphQL', 'REST APIs', 'Microservices', 'CI/CD', 'Git', 'Agile'
    ]
    
    const relevantSkills = job.requiredSkills || []
    const additionalSkills = skillPool.filter(skill => !relevantSkills.includes(skill))
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 3)
    
    return [...relevantSkills, ...additionalSkills]
  }

  /**
   * Smart routing of candidates to appropriate roles
   */
  async smartRouting(candidates: Resume[]): Promise<{ candidateId: string, recommendedJobs: string[], confidence: number }[]> {
    console.log(`🎯 Smart routing ${candidates.length} candidates`)
    
    const jobs = await blink.db.jobs.list({
      where: { userId: (await blink.auth.me()).id },
      limit: 100
    })

    const routingResults = []

    for (const candidate of candidates) {
      const jobMatches = []

      for (const job of jobs) {
        const matchScore = await this.calculateJobMatch(candidate, job)
        if (matchScore > 60) {
          jobMatches.push({ jobId: job.id, score: matchScore })
        }
      }

      // Sort by match score and take top 3
      jobMatches.sort((a, b) => b.score - a.score)
      const topMatches = jobMatches.slice(0, 3)

      routingResults.push({
        candidateId: candidate.id,
        recommendedJobs: topMatches.map(m => m.jobId),
        confidence: topMatches.length > 0 ? topMatches[0].score : 0
      })
    }

    // Store routing results
    await this.storeRoutingResults(routingResults)

    return routingResults
  }

  private async calculateJobMatch(candidate: Resume, job: any): Promise<number> {
    const candidateSkills = candidate.skills || []
    const requiredSkills = JSON.parse(job.requiredSkills || '[]')
    
    if (requiredSkills.length === 0) return 50

    const matchingSkills = candidateSkills.filter(skill => 
      requiredSkills.some((req: string) => 
        req.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(req.toLowerCase())
      )
    )

    const skillMatch = (matchingSkills.length / requiredSkills.length) * 100
    
    // Add experience level matching
    const experienceMatch = this.calculateExperienceMatch(candidate.experience, job.experienceLevel)
    
    return Math.round((skillMatch * 0.7) + (experienceMatch * 0.3))
  }

  private calculateExperienceMatch(candidateExp: string, requiredExp: string): number {
    const candidateYears = this.extractYears(candidateExp)
    const requiredYears = this.extractYears(requiredExp)
    
    if (candidateYears >= requiredYears) return 100
    if (candidateYears >= requiredYears * 0.8) return 80
    if (candidateYears >= requiredYears * 0.6) return 60
    return 40
  }

  private extractYears(experience: string): number {
    const match = experience.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  /**
   * Automatic follow-up and status updates
   */
  async autoFollowUp(screeningResults: ScreeningResult[]): Promise<void> {
    console.log(`📧 Auto follow-up for ${screeningResults.length} candidates`)

    for (const result of screeningResults) {
      try {
        await this.executeAutomationRules(result)
      } catch (error) {
        console.error(`Error in auto follow-up for candidate ${result.candidateId}:`, error)
      }
    }
  }

  private async executeAutomationRules(result: ScreeningResult): Promise<void> {
    const applicableRules = this.automationRules.filter(rule => 
      rule.isActive && this.evaluateRuleConditions(rule, result)
    )

    for (const rule of applicableRules) {
      console.log(`🤖 Executing automation rule: ${rule.name}`)
      
      for (const action of rule.actions) {
        await this.executeAction(action, result)
      }
    }
  }

  private evaluateRuleConditions(rule: AutomationRule, result: ScreeningResult): boolean {
    return rule.conditions.every(condition => {
      const fieldValue = this.getFieldValue(result, condition.field)
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value)
        case 'less_than':
          return Number(fieldValue) < Number(condition.value)
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
        default:
          return false
      }
    })
  }

  private getFieldValue(result: ScreeningResult, field: string): any {
    switch (field) {
      case 'overallScore':
        return result.overallScore
      case 'jobMatchScore':
        return result.jobMatchScore
      case 'decision':
        return result.decision
      case 'confidence':
        return result.confidence
      default:
        return null
    }
  }

  private async executeAction(action: AutomationAction, result: ScreeningResult): Promise<void> {
    switch (action.type) {
      case 'email':
        await this.sendAutomatedEmail(action.parameters, result)
        break
      case 'keka_update':
        await this.updateKekaStatus(action.parameters, result)
        break
      case 'schedule_interview':
        await this.scheduleInterview(action.parameters, result)
        break
      case 'add_tag':
        await this.addCandidateTag(action.parameters, result)
        break
      case 'move_stage':
        await this.moveCandidateStage(action.parameters, result)
        break
    }
  }

  private async sendAutomatedEmail(params: any, result: ScreeningResult): Promise<void> {
    try {
      const candidate = await this.getCandidateDetails(result.candidateId)
      
      await blink.notifications.email({
        to: candidate.email,
        subject: params.subject || 'Application Update',
        html: this.generateEmailTemplate(params.template, result, candidate),
        from: params.from || 'noreply@company.com'
      })
      
      console.log(`📧 Sent automated email to ${candidate.email}`)
    } catch (error) {
      console.error('Error sending automated email:', error)
    }
  }

  private generateEmailTemplate(template: string, result: ScreeningResult, candidate: any): string {
    const templates = {
      'high_score': `
        <h2>Congratulations ${candidate.name}!</h2>
        <p>We're impressed with your application. Your screening score was ${result.overallScore}/100.</p>
        <p>Next steps: ${result.nextSteps?.join(', ')}</p>
        <p>We'll be in touch soon!</p>
      `,
      'rejection': `
        <h2>Thank you for your interest, ${candidate.name}</h2>
        <p>After careful consideration, we've decided to move forward with other candidates.</p>
        <p>We encourage you to apply for future opportunities that match your skills.</p>
      `,
      'interview_invite': `
        <h2>Interview Invitation - ${candidate.name}</h2>
        <p>We'd like to schedule an interview with you. Your screening score was ${result.overallScore}/100.</p>
        <p>Please reply with your availability for the next week.</p>
      `
    }
    
    return templates[template as keyof typeof templates] || templates['high_score']
  }

  private async updateKekaStatus(params: any, result: ScreeningResult): Promise<void> {
    // Mock Keka API integration
    console.log(`🔄 Updating Keka status for candidate ${result.candidateId} to ${params.status}`)
    
    // In production, this would make actual API calls to Keka
    await blink.db.kekaUpdates.create({
      id: `keka_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      candidateId: result.candidateId,
      status: params.status,
      score: result.overallScore,
      tags: JSON.stringify(result.tags),
      updatedAt: new Date().toISOString(),
      userId: (await blink.auth.me()).id
    })
  }

  private async scheduleInterview(params: any, result: ScreeningResult): Promise<void> {
    console.log(`📅 Scheduling interview for candidate ${result.candidateId}`)
    
    // Mock interview scheduling
    await blink.db.interviews.create({
      id: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      candidateId: result.candidateId,
      type: params.type || 'phone_screen',
      scheduledFor: params.scheduledFor || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      interviewer: params.interviewer || 'HR Team',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      userId: (await blink.auth.me()).id
    })
  }

  private async addCandidateTag(params: any, result: ScreeningResult): Promise<void> {
    console.log(`🏷️ Adding tag "${params.tag}" to candidate ${result.candidateId}`)
    
    // Update candidate with new tag
    const existingTags = result.tags || []
    const updatedTags = [...existingTags, params.tag]
    
    await blink.db.resumes.update(result.candidateId, {
      tags: JSON.stringify(updatedTags)
    })
  }

  private async moveCandidateStage(params: any, result: ScreeningResult): Promise<void> {
    console.log(`➡️ Moving candidate ${result.candidateId} to stage ${params.stage}`)
    
    await blink.db.resumes.update(result.candidateId, {
      stage: params.stage,
      stageUpdatedAt: new Date().toISOString()
    })
  }

  /**
   * Initialize default automation rules
   */
  private initializeDefaultRules(): void {
    this.automationRules = [
      {
        id: 'high_score_interview',
        name: 'High Score Auto-Interview',
        trigger: 'candidate_screened',
        conditions: [
          { field: 'overallScore', operator: 'greater_than', value: 85 },
          { field: 'decision', operator: 'equals', value: 'accept' }
        ],
        actions: [
          { type: 'email', parameters: { template: 'interview_invite', subject: 'Interview Invitation' } },
          { type: 'keka_update', parameters: { status: 'interview_scheduled' } },
          { type: 'add_tag', parameters: { tag: 'High Potential' } }
        ],
        isActive: true
      },
      {
        id: 'low_score_rejection',
        name: 'Low Score Auto-Rejection',
        trigger: 'candidate_screened',
        conditions: [
          { field: 'overallScore', operator: 'less_than', value: 40 },
          { field: 'decision', operator: 'equals', value: 'reject' }
        ],
        actions: [
          { type: 'email', parameters: { template: 'rejection', subject: 'Application Status Update' } },
          { type: 'keka_update', parameters: { status: 'rejected' } },
          { type: 'move_stage', parameters: { stage: 'rejected' } }
        ],
        isActive: true
      },
      {
        id: 'medium_score_review',
        name: 'Medium Score Manual Review',
        trigger: 'candidate_screened',
        conditions: [
          { field: 'overallScore', operator: 'greater_than', value: 60 },
          { field: 'overallScore', operator: 'less_than', value: 85 }
        ],
        actions: [
          { type: 'add_tag', parameters: { tag: 'Requires Review' } },
          { type: 'keka_update', parameters: { status: 'under_review' } }
        ],
        isActive: true
      }
    ]
  }

  private initializeDefaultSources(): void {
    this.candidateSources = [
      {
        name: 'LinkedIn',
        type: 'linkedin',
        isActive: true
      },
      {
        name: 'Indeed',
        type: 'job_board',
        isActive: true
      },
      {
        name: 'Direct Applications',
        type: 'direct_application',
        isActive: true
      },
      {
        name: 'Employee Referrals',
        type: 'referral',
        isActive: true
      }
    ]
  }

  // Helper methods
  private async getJobDetails(jobId: string): Promise<Job> {
    const job = await blink.db.jobs.list({
      where: { id: jobId },
      limit: 1
    })
    return job[0] as Job
  }

  private async getCandidateDetails(candidateId: string): Promise<Resume> {
    const candidates = await blink.db.resumes.list({
      where: { id: candidateId },
      limit: 1
    })
    return candidates[0] as Resume
  }

  private async storeCandidates(candidates: Resume[], jobId: string): Promise<void> {
    for (const candidate of candidates) {
      await blink.db.resumes.create({
        ...candidate,
        jobId,
        sourcedAt: new Date().toISOString()
      })
    }
  }

  private async storeRoutingResults(results: any[]): Promise<void> {
    for (const result of results) {
      await blink.db.candidateRouting.create({
        id: `routing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        candidateId: result.candidateId,
        recommendedJobs: JSON.stringify(result.recommendedJobs),
        confidence: result.confidence,
        createdAt: new Date().toISOString(),
        userId: (await blink.auth.me()).id
      })
    }
  }

  // Public API methods
  async addAutomationRule(rule: Omit<AutomationRule, 'id'>): Promise<string> {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    this.automationRules.push(newRule)
    return newRule.id
  }

  async getAutomationRules(): Promise<AutomationRule[]> {
    return this.automationRules
  }

  async toggleAutomationRule(ruleId: string, isActive: boolean): Promise<void> {
    const rule = this.automationRules.find(r => r.id === ruleId)
    if (rule) {
      rule.isActive = isActive
    }
  }
}