// schemas/commonSchemas.js
const mongoose = require('mongoose');
const { Types } = mongoose; // ✅ this line is important

// ✅ Company Schema
const companySchema = new mongoose.Schema({
  companyname: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactperson: {
    type: String,
    trim: true,
  },
  aboutus: {
    type: String,
    trim: true,
  },
  emails: {
    type: [String],
    validate: {
      validator: function (emails) {
        return emails.every(email =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
      },
      message: 'Invalid email format',
    },
    default: [],
  },
  contacts: {
    type: [String],
    validate: {
      validator: function (contacts) {
        return contacts.every(contact =>
          /^[0-9]{10}$/.test(contact)
        );
      },
      message: 'Invalid contact number',
    },
    default: [],
  },
}, {
  timestamps: true,
  collection: 'Company', // 🔁 Optional but useful to set
});

// ✅ Address Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true
  },
  firstname: {
    type: String,
    trim: true
  },
  middlename: {
    type: String,
    trim: true
  },
  surname: {
    type: String,
    trim: true
  },
  mobileno: {
    type: String,
    required: true,
    trim: true
  }
},
  {
    timestamps: true,
    collection: 'User'
  }
);

// ✅ Address Schema
const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  office: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  addresstype: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
},
  {
    timestamps: true,
    collection: 'Address'
  }
);

// ✅ Category Schema
const categorySchema = new mongoose.Schema({
  categoryname: String,
  detail: String,
},
  {
    collection: 'Category'
  });

// ✅ About Us Schema
/* const aboutusSchema = new mongoose.Schema({
  description: String,
  telno: String,
}, { collection: 'Aboutus' }); */

const aboutusSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true,
  collection: 'Aboutus'
});

// ✅ Pet Type Schema
const pettypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true, // Make type required
    },
    sortorder: {
      type: Number,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value.',
      },
    },
    image: {
      type: String, // You can store image as a URL or Base64 string
      validate: {
        validator: function (value) {
          return /^(http|https):\/\/[^ "]+$/.test(value) || /^[A-Za-z0-9+/=]+$/.test(value); // Simple check for URL or Base64
        },
        message: 'Invalid image URL or Base64 string.',
      },
    },
  },
  { collection: 'Pettype' }
);
// ✅ Ad Schema
const adSchema = new mongoose.Schema({
  categoryid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addressid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  pettypeid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pettype',
  },
  adtitle: {
    type: String,
    required: true,
    trim: true
  },
  adclose: { type: Boolean, default: false },
  addescription: {
    type: String,
    required: true,
    trim: true
  },
  images: [String], // store image URLs like /uploads/abc.jpg
  CreatedOn: {
    type: Date,
    default: Date.now,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
},
  {
    timestamps: true,
    collection: 'Ad'
  });

// ✅ Export models
module.exports = {
  Company: mongoose.model('Company', companySchema),
  Address: mongoose.model('Address', addressSchema),
  Category: mongoose.model('Category', categorySchema),
  Pettype: mongoose.model('Pettype', pettypeSchema),
  Ad: mongoose.model('Ad', adSchema),
  Aboutus: mongoose.model('Aboutus', aboutusSchema),
  User: mongoose.model('User', userSchema),
};
