import express from 'express'
import { loginUser, registerUser } from '../controllers/user.controller.js'
import upload from '../middlewares/upload.js'

const router = express.Router()


router.post('/register', upload.single('profilePicture'), registerUser)
router.post('/login', loginUser)

export default router