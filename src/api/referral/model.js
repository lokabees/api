import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const referralSchema = new Schema({
	shop: {
    	type: 'ObjectId',
    	required: true,
    	ref: 'Shop',
  	},
	author: {
		type: 'ObjectId',
		ref: 'User',
		required: false, // if the author is not added then it was an automated action
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	uuid: {
		type: String,
		default: uuidv4()
	}	
})

const model = mongoose.model('Referral', referralSchema)

export const schema = model.schema
export default model
