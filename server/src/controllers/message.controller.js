import Message from '../models/message.model.js'
import Conversation from '../models/conversation.js'


export const createMessage = async (req, res) => {
    try{
        const { conversationId } = req.params
        const { text, replyTo }  = req.body
        const senderId = req.user.userId

        if(!text || !text.trim()){
            return res.status(400).json({
                message: 'Message text is required'
            })
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: senderId
        })

        if(!conversation){
            return res.status(404).json({
                message: 'Conversation not found'
            })
        }

        const message = await Message.create({
            sender: senderId,
            text: text.trim(),
            conversationId,
            replyTo: replyTo || null,
            readBy: [senderId]
        })


        conversation.lastMessage = message._id
        conversation.lastMessageAt = new Date()
        conversation.readBy = [senderId]
        await conversation.save()

        const populatedMessage = await message.populate('sender', 'username profilePicture')

        res.status(201).json({
            message: 'Message sent',
            data: populatedMessage
        })

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        })

    }

}

export const getMessages = async (req, res) => {
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

        const messages = await Message.find({
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




