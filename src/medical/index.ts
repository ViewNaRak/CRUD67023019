import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const medicalRoutes = new Hono()

let medicalCases = [
  {
    MedicalID: 'HN-1001',
    Date: '2023-10-25',
    Time: '09:00',
    Status: 'ยืนยันแล้ว',
    Notes: 'ตรวจสุขภาพประจำปี (Check-up)'
  }
]

const medicalSchema = z.object({
  Date: z.string().min(1, { message: "กรุณาระบุวันที่" }),
  Time: z.string().min(1, { message: "กรุณาระบุเวลา" }),
  Status: z.enum(['รอการยืนยัน', 'ยืนยันแล้ว', 'ยกเลิก', 'เสร็จสิ้น'] as const),
  Notes: z.string().optional()
})


medicalRoutes.get('/', (c) => {
  return c.json({
    success: true,
    message: 'ดึงข้อมูลการแพทย์สำเร็จ',
    data: medicalCases
  })
})

medicalRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const data = medicalCases.find(m => m.MedicalID === id)
  
  if (!data) {
    return c.json({ success: false, message: 'ไม่พบข้อมูล' }, 404)
  }
  return c.json({ success: true, data: data })
})

medicalRoutes.post('/', 
  zValidator('json', medicalSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง', errors: result.error }, 400)
    }
  }),
  async (c) => {
    const body = c.req.valid('json')
    const newId = 'HN-' + Date.now().toString().slice(-4)
    
    const newCase = {
      MedicalID: newId, 
      Date: body.Date,
      Time: body.Time,
      Status: body.Status,
      Notes: body.Notes || ''
    }
    medicalCases.push(newCase)
    return c.json({ success: true, message: 'บันทึกข้อมูลการแพทย์สำเร็จ', data: newCase }, 201)
  }
)

medicalRoutes.put('/:id', 
  zValidator('json', medicalSchema),
  async (c) => {
    const id = c.req.param('id')
    const body = c.req.valid('json')
    const index = medicalCases.findIndex(m => m.MedicalID === id)

    if (index === -1) {
      return c.json({ success: false, message: 'ไม่พบข้อมูลที่จะแก้ไข' }, 404)
    }

    medicalCases[index] = { 
      ...medicalCases[index], 
      Date: body.Date,
      Time: body.Time,
      Status: body.Status,
      Notes: body.Notes || medicalCases[index].Notes
    }
    
    return c.json({ success: true, message: 'แก้ไขข้อมูลสำเร็จ', data: medicalCases[index] })
  }
)

medicalRoutes.delete('/:id', (c) => {
  const id = c.req.param('id')
  const initialLength = medicalCases.length
  medicalCases = medicalCases.filter(m => m.MedicalID !== id)

  if (medicalCases.length === initialLength) {
    return c.json({ success: false, message: 'ไม่พบข้อมูลที่จะลบ' }, 404)
  }

  return c.json({ success: true, message: 'ลบข้อมูลเรียบร้อย' })
})

export default medicalRoutes