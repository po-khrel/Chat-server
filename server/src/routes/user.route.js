import express from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
import upload from '../middlewares/upload.js'

const router = express.Router()


router.post('/register', upload.single('profilePicture'), registerUser)
router.post('/login', loginUser)
router.post('/logout/:id', logoutUser)

export default router