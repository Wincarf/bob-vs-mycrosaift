import type { DemoChallenge, ScenarioScript } from '@/types'
import { passwordResetScenario } from './password-reset'
import { fileUploadScenario } from './file-upload'

export const SCENARIOS: Record<string, ScenarioScript> = {
  'password-reset': passwordResetScenario,
  'file-upload': fileUploadScenario,
}

export const DEMO_CHALLENGES: DemoChallenge[] = [
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Build a password reset endpoint with email verification.',
    script_key: 'password-reset',
    tag: 'FEATURED',
  },
  {
    id: 'file-upload',
    name: 'File Upload API',
    description: 'Add an API endpoint for secure file uploads.',
    script_key: 'file-upload',
    tag: 'SECURITY',
  },
]
