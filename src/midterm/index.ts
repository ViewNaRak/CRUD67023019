import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const midtermRoutes = new Hono()

let midterms = [
  {
    MidtermID: '1001',
    Date: '2023-10-25',
    Time: '09:00',
    Status: 'ยืนยันแล้ว',
    Notes: 'สอบกลางภาควิชา Web'
  }
]

const midtermSchema = z.object({
  Date: z.string().min(1, { message: "กรุณาระบุวันที่" }),
  Time: z.string().min(1, { message: "กรุณาระบุเวลา" }),
  Status: z.enum(['รอการยืนยัน', 'ยืนยันแล้ว', 'ยกเลิก', 'เสร็จสิ้น'] as const),
  Notes: z.string().optional()
})

midtermRoutes.get('/', (c) => {
  return c.json({
    success: true,
    message: 'ดึงข้อมูล Midterm สำเร็จ',
    data: midterms
  })
})

midtermRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const data = midterms.find(m => m.MidtermID === id)
  
  if (!data) {
    return c.json({ success: false, message: 'ไม่พบข้อมูล' }, 404)
  }
  return c.json({ success: true, data: data })
})

midtermRoutes.post('/', 
  zValidator('json', midtermSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง', errors: result.error }, 400)
    }
  }),
  async (c) => {
    const body = c.req.valid('json')
    const newItem = {
      MidtermID: Date.now().toString().slice(-4), 
      Date: body.Date,
      Time: body.Time,
      Status: body.Status,
      Notes: body.Notes || ''
    }
    midterms.push(newItem)
    return c.json({ success: true, message: 'บันทึกสำเร็จ', data: newItem }, 201)
  }
)

midtermRoutes.put('/:id', 
  zValidator('json', midtermSchema),
  async (c) => {
    const id = c.req.param('id')
    const body = c.req.valid('json')
    const index = midterms.findIndex(m => m.MidtermID === id)

    if (index === -1) {
      return c.json({ success: false, message: 'ไม่พบข้อมูลที่จะแก้ไข' }, 404)
    }

    midterms[index] = { 
      ...midterms[index], 
      Date: body.Date,
      Time: body.Time,
      Status: body.Status,
      Notes: body.Notes || midterms[index].Notes
    }
    
    return c.json({ success: true, message: 'แก้ไขสำเร็จ', data: midterms[index] })
  }
)

midtermRoutes.delete('/:id', (c) => {
  const id = c.req.param('id')
  const initialLength = midterms.length
  midterms = midterms.filter(m => m.MidtermID !== id)

  if (midterms.length === initialLength) {
    return c.json({ success: false, message: 'ไม่พบข้อมูลที่จะลบ' }, 404)
  }

  return c.json({ success: true, message: 'ลบข้อมูลเรียบร้อย' })
})

export default midtermRoutes