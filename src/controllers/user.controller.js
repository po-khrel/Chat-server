import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res) => {
    try {
        const { username, email, password }  = req.body;

        // Checking if the user already exists

        if(!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        const existingUser = await User.findOne( { email })
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' })
        }

        // hashing the password

        const hashedPassword = await bcrypt.hash(password, 10)


        // Creating a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        console.log('New user created:', newUser) // Logging the new user object

        await newUser.save()

        res.status(201).json({ message: 'User registered successfully' })


    }catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        // Checking if the user exists

        const user = await User.findOne({ email })
        
        if(!user){
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        // Comparing the password

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        // Generating a JWT token

        
        const token = jwt.sign(
            { userId: user._id},
             process.env.JWT_SECRET, 
             { 
                expiresIn: '1h'
            }
            )

        // Sending the token in the response
        res.status(200).json({ message: 'Login successful', token })
   
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}