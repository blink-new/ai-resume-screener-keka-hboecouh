import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Filter } from 'lucide-react'

interface FilterPanelProps {
  onFiltersChange: (filters: ResumeFilters) => void
  availableSkills: string[]
  availableTags: string[]
}

export interface ResumeFilters {
  search: string
  minScore: number
  maxScore: number
  minExperience: number
  maxExperience: number
  skills: string[]
  tags: string[]
  education: string
  status: string
}

export function FilterPanel({ onFiltersChange, availableSkills, availableTags }: FilterPanelProps) {
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

  const updateFilters = (newFilters: Partial<ResumeFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const addSkill = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      updateFilters({ skills: [...filters.skills, skill] })
    }
  }

  const removeSkill = (skill: string) => {
    updateFilters({ skills: filters.skills.filter(s => s !== skill) })
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] })
    }
  }

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) })
  }

  const clearFilters = () => {
    const clearedFilters: ResumeFilters = {
      search: '',
      minScore: 0,
      maxScore: 100,
      minExperience: 0,
      maxExperience: 20,
      skills: [],
      tags: [],
      education: 'all',
      status: 'all'
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name, email, or skills..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Score Range */}
        <div>
          <Label>Score Range: {filters.minScore}% - {filters.maxScore}%</Label>
          <div className="mt-2">
            <Slider
              value={[filters.minScore, filters.maxScore]}
              onValueChange={([min, max]) => updateFilters({ minScore: min, maxScore: max })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Experience Range */}
        <div>
          <Label>Experience: {filters.minExperience} - {filters.maxExperience} years</Label>
          <div className="mt-2">
            <Slider
              value={[filters.minExperience, filters.maxExperience]}
              onValueChange={([min, max]) => updateFilters({ minExperience: min, maxExperience: max })}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="exported">Exported</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Education */}
        <div>
          <Label>Education</Label>
          <Select value={filters.education} onValueChange={(value) => updateFilters({ education: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All education levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All education levels</SelectItem>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Bachelor's">Bachelor's</SelectItem>
              <SelectItem value="Master's">Master's</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills */}
        <div>
          <Label>Skills</Label>
          <Select onValueChange={addSkill}>
            <SelectTrigger>
              <SelectValue placeholder="Add skills..." />
            </SelectTrigger>
            <SelectContent>
              {availableSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <Select onValueChange={addTag}>
            <SelectTrigger>
              <SelectValue placeholder="Add tags..." />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}