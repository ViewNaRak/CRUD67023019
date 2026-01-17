import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const userRoutes = new Hono()


const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

userRoutes.get('/', (c) => {
  return c.json({ message: 'List of users' })
})

userRoutes.get('/:id', (c) => {
  const { id } = c.req.param()
  return c.json({ message: `User details for ID: ${id}` })
})

userRoutes.post('/', 
  zValidator('json', createUserSchema),
  async (c) => {
    const body = await c.req.json()
    return c.json({ message: 'User created', data: body })
  }
)

export default userRoutes