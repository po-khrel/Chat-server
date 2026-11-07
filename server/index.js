import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import connectDB from './src/config/db.js'
import userRoutes from './src/routes/user.route.js'
import conversationRoutes from './src/routes/conversation.route.js'
import messageRoute from './src/routes/message.route.js'
import http from 'http'
import { Server } from 'socket.io'
import Message from './src/models/message.model.js'
import Conversation from './src/models/conversation.js'


const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})

io.use((socket, next) => {
    const token = socket.handshake.auth?.token

    if (!token) {
        return next(new Error('Authentication required'))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.userId = decoded.userId
        next()
    } catch {
        next(new Error('Invalid or expired token'))
    }
})

io.on('connection', (socket) => {
    console.log('User connected:', socket.userId)

    socket.on('joinConversation', async (conversationId) => {
        try {
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: socket.userId
            })

            if (conversation) {
                socket.join(`conversation:${conversationId}`)
            } else {
                socket.emit('messageError', 'Conversation not found')
            }
        } catch {
            socket.emit('messageError', 'Invalid conversation ID')
        }
    })

    socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`)
    })

    socket.on('sendMessage', async ({ conversationId, text }) => {
        try {
            if (!text?.trim()) {
                return
            }

            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: socket.userId
            })

            if (!conversation) {
                socket.emit('messageError', 'Conversation not found')
                return
            }

            const message = await Message.create({
                sender: socket.userId,
                text: text.trim(),
                conversationId,
                readBy: [socket.userId]
            })

            conversation.lastMessage = message._id
            conversation.lastMessageAt = new Date()
            conversation.readBy = [socket.userId]
            await conversation.save()

            const savedMessage = await message.populate(
                'sender',
                'username profilePicture'
            )

            io.to(`conversation:${conversationId}`).emit(
                'newMessage',
                savedMessage
            )
        } catch {
            socket.emit('messageError', 'Unable to send message')
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId)
    })
})





app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())

connectDB()

app.use('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})





const Port = process.env.PORT || 3000


app.use('/api/users', userRoutes)
app.use('/api/conv', conversationRoutes)
app.use('/api/messages', messageRoute)



httpServer.listen(Port, () => {
    console.log(`Server is running on ${Port}`)
})