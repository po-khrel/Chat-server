import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
    
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',

    },
    lastMessageAt: {
        type: Date,
        isGroup: {
            type: Boolean,
            default: false
        }
    },
    groupName: {
        type: String,
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
    



}, { timestamps: true})

const Conversation = mongoose.model('Conversation', conversationSchema)
export default Conversation