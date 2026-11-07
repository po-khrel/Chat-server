import Conversation from '../models/conversation.js'
import Message from '../models/message.model.js'

export const getConversations = async (req, res) => {
    try {
        const { conversationId } = req.params
        const userId = req.user.userId

        const conversations = await Conversation.find({
            _id: conversationId,
            participants: userId  
        })

        if(!conversations){
            return res.status(404).json({
                message: 'No conversations found'
            })
        }

        const messages = await Message.findOne({
            conversationId
        }).populate('sender', 'username profilePicture')
          .populate('replyTo')
          .sort({ createdAt: 1})


          res.status(200).json({
            messages
          })

      
    } catch (error) {
       res.status(500).json({
        message: 'Server error',
        error: error.message
       })
    }
}





export const createConversation = async (req, res) => {
    try {
        const { receiverId } = req.body
        const senderId = req.user.userId

        if( !receiverId) {
            return res.status(400).json({
                message: 'receiverId is required'
            })
        }

        if(senderId === receiverId) {
            return res.status(400).json({
                message: 'You cannot create a conversation with yourself'
            })
        }
        
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [senderId, receiverId ] }

        })

        if(!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                isGroup: false
            })
        }

        res.status(201).json({
            message: 'Conversation created successfully',
            conversation
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        })
    }
}