import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './src/config/db.js'
import userRoutes from './src/routes/user.route.js'
import conversationRoutes from './src/routes/conversation.route.js'
import messageRoute from './src/routes/message.route.js'



const app = express()





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



app.listen(Port, () => {
    console.log(`Server is running on ${Port}`)
})