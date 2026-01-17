import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const productRoutes = new Hono()

const createProductSchema = z.object({
  code: z.string()
    .length(5, { message: "รหัสสินค้าต้องมี 5 ตัวอักษร" })
    .regex(/^[0-9]+$/, { message: "รหัสสินค้าต้องเป็นตัวเลขเท่านั้น" }),

  name: z.string()
    .min(5, { message: "ชื่อสินค้าต้องยาวไม่น้อยกว่า 5 ตัวอักษร" }),

  price: z.number(),

  cost: z.number(),

  remark: z.string().optional()
})

productRoutes.post(
  '/',
  zValidator('json', createProductSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง (Validation Error)',
        errors: result.error.issues.map((issue) => issue.message)
      }, 400)
    }
  }),
  async (c) => {
    const data = c.req.valid('json')
    return c.json({
      success: true,
      message: 'บันทึกสินค้าเรียบร้อย',
      data: data
    }, 201)
  }
)

export default productRoutes