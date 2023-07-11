const mongoose = require("mongoose");
const slugify = require('slugify');
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "please add a name"],
		unique: true,
		trim: true,
		maxlength: [50, "name cannot be more than 50 characters"],
	},
	slug: String,
	description: {
		type: String,
		required: [true, 'please add a description'],
		maxlength: [500, 'Description cannot be more than 500 characters']
	},
	website: {
		type: String,
		match: [
			/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
			"please enter a valid URL with HTTP or HTTPS"
		]
	},

	phone: {
		type: String,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.w(2,3))+$/,
			"please enter a valid email"
		]
	}, 
	email: {
		type: String,
		match: [/^\w+([\.-]?\w+)*@w+([\.-]?\w+)*(\.\w{2,3})+$/]
	},
	address: {
		type: String,
		required: [true, 'Please enter a valid address']
	},

	location: {
		// Geojason point
		type: {
			type: String,
			enum: ['Point'],
			required: true
		  },

		  coordinates: {
			type: [Number],
			required: true,
			index: '2dsphere'
		  },

		  formattedAddress: String,
		  street: String,
		  city: String,
		  state: String,
		  zipcode: String,
		  country: String
	},

	careers: {
		// Array of strings
		type: [String],
		required: true,
		enum: [
			'web Developmemnt',
			'Mobile developent',
			'UI/UX',
			'Data Science',
			'Business',
			'Other' 
		]
	},

	averageRating: {
		type: Number,
		min: [1, 'Rating must be at lesst 1'],
		max: [10, 'Rating can not be more than 10']
	},

	averageCost: Number,
	photo: {
		type: String,
		default: 'no-photo.jpg'
	},
	housing: {
		type: Boolean,
		default: false
	},
	jobAssistance: {
		type: Boolean,
		default: false
	},
	jobGuarantee: {
		type: Boolean,
		default: false
	},
	acceptGi: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
	toJSON: {virtuals: true},
	toObject: {virtuals: true}
});

// create bootcamp slug from  the name
BootcampSchema.pre('save', function(next) {
	// console.log('slugify ran', this.name);
	this.slug = slugify(this.name, {lower:true });
	next();
});

// Geocode and create location field
BootcampSchema.pre('save', async function(next) {
	const loc = await geocoder.geocode(this.address);
	this.location = {
		type: 'point',
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode,
	}

	// Do not save address in Db
	this.address = undefined
	next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
	console.log(`courses being removed from bootcamp ${this._id}`);
	await this.model('Course').deletemany({bootcamp: this._id});
	next();
});

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
	ref: 'Course',
	localField: '_id',
	foreignField: 'bootcamp',
	justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);



