const mongoose = require('mongoose')

const { Schema, model } = mongoose

const petSchema = new Schema (
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
        age: {
            type: Number,
            required: true
        },
        adoptable: {
            type: Boolean,
            required: true
        },
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
        // we're going to add virtual to our model
        // these lines insure that the virtual will be included 
        // whenever we turn our document to an onject or JSON
        toObject: { virtuals: true},
        toJSON: { virtuals: true }
	}
)
// virtuals ge herre(we'll build these later)
// virtual is a virtual property that uses datat we've save in the databas to add a property w
// whenever we retrieve that document and convert to an object
petSchema.virtual('fullTitle').get(function () {
    // we can dow hatever javascripty things we want in here 
    // just need to be sure we return value
    // full title is going to combine the name and type to build a title 
    return `${this.name} the ${this.type}`
})

petSchema.virtual('isABaby'). get(function (){
    if (this.age < 5) {
        return 'yeah theyre just a baby'
    } else if (this.age >= 5 && this.age < 10) {
        return 'not really a baby. but still a baby'
    } else {
        return 'a good ole pet'
    }
})
module.exports = mongoose.model('Pet', petSchema)
