import express from 'express'

import { createConversation, getConversations } from '../controllers/conversation.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()


router.post('/', authMiddleware, createConversation)
router.get('/:conversationId/messages', authMiddleware, getConversations)

export default router














