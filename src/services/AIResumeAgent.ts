import { createClient } from '@blinkdotnew/sdk'
import type { Resume, Job, ScreeningResult, BiasReport, PerformanceMetrics } from '../types/resume'

const blink = createClient({
  projectId: 'ai-resume-screener-keka-hboecouh',
  authRequired: true
})

export interface AgentDecision {
  action: 'accept' | 'reject' | 'review' | 'interview'
  confidence: number
  reasoning: string[]
  nextSteps: string[]
}

export interface LearningFeedback {
  candidateId: string
  predictedOutcome: string
  actualOutcome: string
  accuracy: number
  improvementAreas: string[]
}

export class AIResumeAgent {
  private learningData: LearningFeedback[] = []
  private performanceMetrics: PerformanceMetrics = {
    totalScreened: 0,
    accuracyRate: 0,
    avgProcessingTime: 0,
    biasScore: 0,
    hiringSuccessRate: 0
  }

  /**
   * Phase 1: Autonomous AI Agent - Self-managing screening workflow
   */
  async autonomousScreening(
    candidates: Resume[], 
    jobRequirement: Job,
    intakeDocument?: string
  ): Promise<ScreeningResult[]> {
    const results: ScreeningResult[] = []
    
    console.log(`🤖 AI Agent: Starting autonomous screening for ${candidates.length} candidates`)
    
    for (const candidate of candidates) {
      try {
        // Self-managing decision making
        const decision = await this.makeAutonomousDecision(candidate, jobRequirement, intakeDocument)
        
        // Adaptive learning from previous outcomes
        const adaptedScore = await this.applyLearningAdaptation(candidate, decision)
        
        // Intelligent routing based on decision
        const routing = await this.intelligentRouting(decision, jobRequirement)
        
        const result: ScreeningResult = {
          candidateId: candidate.id,
          overallScore: adaptedScore.overallScore,
          jobMatchScore: adaptedScore.jobMatchScore,
          decision: decision.action,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          nextSteps: routing.nextSteps,
          tags: adaptedScore.tags,
          biasFlags: adaptedScore.biasFlags,
          culturalFit: adaptedScore.culturalFit,
          growthPotential: adaptedScore.growthPotential,
          processedAt: new Date().toISOString()
        }
        
        results.push(result)
        
        // Update performance metrics
        this.updatePerformanceMetrics(result)
        
      } catch (error) {
        console.error(`Error processing candidate ${candidate.id}:`, error)
        // Agent handles edge cases autonomously
        results.push(await this.handleEdgeCase(candidate, error))
      }
    }
    
    // Store results for learning
    await this.storeScreeningResults(results)
    
    return results
  }

  private async makeAutonomousDecision(
    candidate: Resume, 
    job: Job, 
    intakeDoc?: string
  ): Promise<AgentDecision> {
    const prompt = `
    You are an autonomous AI hiring agent. Analyze this candidate and make a hiring decision.
    
    CANDIDATE:
    Name: ${candidate.name}
    Email: ${candidate.email}
    Skills: ${candidate.skills?.join(', ')}
    Experience: ${candidate.experience}
    Education: ${candidate.education}
    
    JOB REQUIREMENTS:
    Title: ${job.title}
    Department: ${job.department}
    Required Skills: ${job.requiredSkills?.join(', ')}
    Experience Level: ${job.experienceLevel}
    ${intakeDoc ? `\nINTAKE DOCUMENT:\n${intakeDoc}` : ''}
    
    LEARNING DATA:
    Previous successful hires had these patterns: ${this.getLearningPatterns()}
    
    Make an autonomous decision (accept/reject/review/interview) with:
    1. Confidence score (0-100)
    2. Detailed reasoning (3-5 points)
    3. Specific next steps
    4. Bias check - flag any potential bias in decision
    
    Return JSON format:
    {
      "action": "accept|reject|review|interview",
      "confidence": 85,
      "reasoning": ["point1", "point2", "point3"],
      "nextSteps": ["step1", "step2"],
      "biasFlags": ["flag1", "flag2"] or [],
      "overallScore": 85,
      "jobMatchScore": 90,
      "tags": ["Senior", "Remote Ready", "Leadership"],
      "culturalFit": 80,
      "growthPotential": 75
    }
    `

    try {
      const { object } = await blink.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['accept', 'reject', 'review', 'interview'] },
            confidence: { type: 'number' },
            reasoning: { type: 'array', items: { type: 'string' } },
            nextSteps: { type: 'array', items: { type: 'string' } },
            biasFlags: { type: 'array', items: { type: 'string' } },
            overallScore: { type: 'number' },
            jobMatchScore: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            culturalFit: { type: 'number' },
            growthPotential: { type: 'number' }
          },
          required: ['action', 'confidence', 'reasoning', 'nextSteps', 'overallScore', 'jobMatchScore']
        }
      })

      return {
        action: object.action as 'accept' | 'reject' | 'review' | 'interview',
        confidence: object.confidence,
        reasoning: object.reasoning,
        nextSteps: object.nextSteps
      }
    } catch (error) {
      console.error('Error in autonomous decision making:', error)
      return {
        action: 'review',
        confidence: 50,
        reasoning: ['Error in AI analysis - requires manual review'],
        nextSteps: ['Manual review required', 'Check candidate details']
      }
    }
  }

  private async applyLearningAdaptation(candidate: Resume, decision: AgentDecision): Promise<any> {
    // Apply learning from previous hiring outcomes
    const learningAdjustment = this.calculateLearningAdjustment(candidate)
    
    return {
      overallScore: Math.min(100, decision.confidence + learningAdjustment.scoreAdjustment),
      jobMatchScore: Math.min(100, decision.confidence + learningAdjustment.matchAdjustment),
      tags: [...(decision.reasoning || []), ...learningAdjustment.additionalTags],
      biasFlags: learningAdjustment.biasFlags || [],
      culturalFit: learningAdjustment.culturalFit || 75,
      growthPotential: learningAdjustment.growthPotential || 70
    }
  }

  private async intelligentRouting(decision: AgentDecision, job: Job): Promise<{ nextSteps: string[] }> {
    const routingMap = {
      'accept': [
        'Schedule technical interview',
        'Send to hiring manager',
        'Prepare interview questions',
        'Check references'
      ],
      'interview': [
        'Schedule phone screening',
        'Send coding challenge',
        'Review portfolio',
        'Cultural fit assessment'
      ],
      'review': [
        'Flag for manual review',
        'Request additional information',
        'Schedule brief call',
        'Check similar profiles'
      ],
      'reject': [
        'Send polite rejection email',
        'Add to talent pool for future',
        'Provide feedback if requested',
        'Update ATS status'
      ]
    }

    return {
      nextSteps: routingMap[decision.action] || ['Manual review required']
    }
  }

  private calculateLearningAdjustment(candidate: Resume): any {
    // Analyze learning data to adjust scoring
    const similarCandidates = this.learningData.filter(data => 
      this.calculateSimilarity(candidate, data) > 0.7
    )

    if (similarCandidates.length === 0) {
      return {
        scoreAdjustment: 0,
        matchAdjustment: 0,
        additionalTags: [],
        biasFlags: [],
        culturalFit: 75,
        growthPotential: 70
      }
    }

    const avgAccuracy = similarCandidates.reduce((sum, data) => sum + data.accuracy, 0) / similarCandidates.length
    
    return {
      scoreAdjustment: avgAccuracy > 0.8 ? 5 : avgAccuracy < 0.6 ? -5 : 0,
      matchAdjustment: avgAccuracy > 0.8 ? 3 : avgAccuracy < 0.6 ? -3 : 0,
      additionalTags: avgAccuracy > 0.8 ? ['High Potential'] : [],
      biasFlags: avgAccuracy < 0.6 ? ['Review for bias'] : [],
      culturalFit: Math.round(75 + (avgAccuracy - 0.7) * 50),
      growthPotential: Math.round(70 + (avgAccuracy - 0.7) * 60)
    }
  }

  private calculateSimilarity(candidate: Resume, learningData: LearningFeedback): number {
    // Simple similarity calculation based on skills and experience
    // In production, this would be more sophisticated
    return Math.random() * 0.4 + 0.6 // Mock similarity for now
  }

  private getLearningPatterns(): string {
    if (this.learningData.length === 0) {
      return 'No learning data available yet'
    }

    const successfulHires = this.learningData.filter(data => data.actualOutcome === 'hired')
    return `${successfulHires.length} successful hires analyzed`
  }

  private async handleEdgeCase(candidate: Resume, error: any): Promise<ScreeningResult> {
    return {
      candidateId: candidate.id,
      overallScore: 0,
      jobMatchScore: 0,
      decision: 'review',
      confidence: 0,
      reasoning: [`Error processing candidate: ${error.message}`],
      nextSteps: ['Manual review required', 'Check data quality'],
      tags: ['Error', 'Requires Review'],
      biasFlags: [],
      culturalFit: 0,
      growthPotential: 0,
      processedAt: new Date().toISOString()
    }
  }

  private updatePerformanceMetrics(result: ScreeningResult): void {
    this.performanceMetrics.totalScreened++
    // Update other metrics based on result
  }

  private async storeScreeningResults(results: ScreeningResult[]): Promise<void> {
    try {
      for (const result of results) {
        await blink.db.screeningResults.create({
          id: `screening_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          candidateId: result.candidateId,
          overallScore: result.overallScore,
          jobMatchScore: result.jobMatchScore,
          decision: result.decision,
          confidence: result.confidence,
          reasoning: JSON.stringify(result.reasoning),
          nextSteps: JSON.stringify(result.nextSteps),
          tags: JSON.stringify(result.tags),
          biasFlags: JSON.stringify(result.biasFlags || []),
          culturalFit: result.culturalFit || 0,
          growthPotential: result.growthPotential || 0,
          processedAt: result.processedAt,
          userId: (await blink.auth.me()).id
        })
      }
    } catch (error) {
      console.error('Error storing screening results:', error)
    }
  }

  /**
   * Phase 2: Advanced Analytics - Add learning feedback
   */
  async addLearningFeedback(feedback: LearningFeedback): Promise<void> {
    this.learningData.push(feedback)
    
    // Store in database
    await blink.db.learningFeedback.create({
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      candidateId: feedback.candidateId,
      predictedOutcome: feedback.predictedOutcome,
      actualOutcome: feedback.actualOutcome,
      accuracy: feedback.accuracy,
      improvementAreas: JSON.stringify(feedback.improvementAreas),
      createdAt: new Date().toISOString(),
      userId: (await blink.auth.me()).id
    })

    // Update performance metrics
    this.recalculatePerformanceMetrics()
  }

  private recalculatePerformanceMetrics(): void {
    if (this.learningData.length === 0) return

    const totalAccuracy = this.learningData.reduce((sum, data) => sum + data.accuracy, 0)
    this.performanceMetrics.accuracyRate = totalAccuracy / this.learningData.length

    const successfulHires = this.learningData.filter(data => data.actualOutcome === 'hired').length
    this.performanceMetrics.hiringSuccessRate = successfulHires / this.learningData.length
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.performanceMetrics
  }

  async getBiasReport(): Promise<BiasReport> {
    // Analyze screening results for bias patterns
    const results = await blink.db.screeningResults.list({
      where: { userId: (await blink.auth.me()).id },
      limit: 1000
    })

    return {
      overallBiasScore: 0.15, // Mock data - would be calculated from results
      genderBias: 0.12,
      ageBias: 0.08,
      educationBias: 0.20,
      recommendations: [
        'Review education requirements - may be too restrictive',
        'Consider blind resume screening for initial rounds',
        'Diversify interview panel composition'
      ],
      flaggedDecisions: results.filter(r => 
        JSON.parse(r.biasFlags || '[]').length > 0
      ).length
    }
  }
}