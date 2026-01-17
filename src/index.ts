import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import userRoutes from './users/index.js'
import roleRoutes from './roles/index.js'
import productRoutes from './products/index.js'
import medicalRoutes from './medical/index.js'

import db from './db/index.js'

const app = new Hono()

app.route('/api/users', userRoutes)
app.route('/api/roles', roleRoutes)
app.route('/api/products', productRoutes)
app.route('/api/medical', medicalRoutes) 

app.get('/', (c) => {
  return c.text('สวัสดี! นี่คือระบบข้อมูลการแพทย์ (Medical Group)')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})