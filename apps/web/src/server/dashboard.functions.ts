import { buildDashboard } from '@askesis/core'
import { demoCollection } from '@askesis/core/demo'
import { createServerFn } from '@tanstack/react-start'

// The public home page runs on a simulated learner (seeded FSRS history), so the
// whole dashboard can be tried without an account; actions that need one open
// a login popup instead.
export const getDemoDashboard = createServerFn({ method: 'GET' }).handler(() => buildDashboard(demoCollection(), true))
