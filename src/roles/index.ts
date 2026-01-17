import { Hono } from 'hono'

const roleRoutes = new Hono()

roleRoutes.get('/', (c) => {
  return c.json({ message: 'List of Roles' })
})

export default roleRoutes