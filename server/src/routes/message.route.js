import express from 'express'
import { authMiddleware  } from '../middlewares/auth.middleware.js'
import { createMessage, getMessages } from '../controllers/message.controller.js'
const router = express.Router()

router.post('/:conversationId', authMiddleware, createMessage)
router.get('/:conversationId', authMiddleware, getMessages)

export default router