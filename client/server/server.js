// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const Address = require('./schemas/commonSchemas').Address; // Import the Address model
const Category = require('./schemas/commonSchemas').Category;
const Pettype = require('./schemas/commonSchemas').Pettype;
const Ad = require('./schemas/commonSchemas').Ad;
const Aboutus = require('./schemas/commonSchemas').Aboutus;
const Company = require('./schemas/commonSchemas').Company;
const User = require('./schemas/commonSchemas').User;
const app = express();
const PORT = process.env.PORT || 5000;
const fs = require('fs');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

console.log('✅ Aboutus model loaded:', typeof Aboutus); // Should be 'function'
// Connect to MongoDB Atlas
const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  dbName: 'Testing', // ← Make sure this matches exactly (case-sensitive!)
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { Types } = mongoose; // ✅ this line is important

app.use((req, res, next) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const db = mongoose.connection;

// Check MongoDB connection status
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// In-memory store for OTP (you can use a database or Redis for production)
const otpStore = {};

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Correctly extract the token
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

app.post('/api/send-otp', (req, res) => {
  const { mobileno } = req.body;
  //console.log('enter send otp' + mobileno)
  // Generate a random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP temporarily (in memory for this example)
  otpStore[mobileno] = otp;

  // Send OTP via SMS using Twilio
  client.messages
    .create({
      body: `Your OTP is ${otp}`,
      // from: '+1234567890', // your Twilio number
      from: process.env.TWILIO_PHONE_NUMBER, // your Twilio number
      to: mobileno,
    })
    .then((message) => {
      console.log('OTP sent: ', message.sid);
      res.status(200).json({ message: 'OTP sent successfully' });
    })
    .catch((error) => {
      console.error('Error sending OTP: ', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    });
});

const generateToken = (user) => {
  const payload = {
    userId: user._id,  // User's unique ID or other relevant data
    mobileno: user.mobileno,  // Or any other data you want to store in the token
  };

  // Sign the token with a secret key and set an expiration time (e.g., 1 hour)
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

  return token;
};

// API to verify OTP
/* app.post('/api/verify-otp', async (req, res) => {
  const { mobileno, otp } = req.body;

  console.log('mobile no ', otpStore[mobileno]);
  console.log('otp ', otp);

  // Check if OTP matches
  if (otpStore[mobileno] === otp) {
    try {
      // Check if user already exists
      let user = await User.findOne({ mobileno });

      // If not, create new user
      if (!user) {
        user = new User({ mobileno });
        await user.save();
      }

      // Generate JWT token (replace with actual secret and expiration as needed)
      const token = 'sample_jwt_token'; // Replace with real JWT later
      res.status(200).json({ token });

      // Clear OTP after successful verification
      delete otpStore[mobileno];
    } catch (error) {
      console.error('Error verifying OTP or saving user:', error);
      res.status(500).json({ error: 'Server error during OTP verification' });
    }
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
}); */

app.post('/api/verify-otp', async (req, res) => {
  const { mobileno, otp } = req.body;

  if (otpStore[mobileno] === otp) {
    try {
      let user = await User.findOne({ mobileno });

      if (!user) {
        user = new User({ mobileno });
        await user.save();
      }

      // Generate the real JWT token
      const token = generateToken(user);  // Generate the token using the helper function

      res.status(200).json({ token });  // Send the token to the client

      // Clear OTP after successful verification
      delete otpStore[mobileno];
    } catch (error) {
      console.error('Error verifying OTP or saving user:', error);
      res.status(500).json({ error: 'Server error during OTP verification' });
    }
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

// Routes
app.post('/api/ads', upload.array('images', 5), async (req, res) => {
  try {
    console.log('enter here11');
    console.log('Received ad creation request');

    const uploadDir = path.join(__dirname, 'uploads');
    console.log('uploadDir ' + uploadDir);
    // Create the folder if it does not exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // 'recursive: true' ensures nested directories can be created
      console.log('Uploads directory created!');
    } else {
      console.log('Uploads directory already exists.');
    }

    const {
      companyId,
      categoryid,
      addressid,
      pettypeid,
      adtitle,
      addescription,
      userId
    } = req.body;

    // Check required fields
    if (!companyId || !categoryid || !addressid || !pettypeid || !adtitle || !addescription || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Map uploaded files to image URLs
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    console.log('imageUrls ' + imageUrls);

    // Build ad object
    const adData = {
      companyId,
      categoryid,
      addressid,
      pettypeid,
      adtitle,
      addescription,
      images: imageUrls,
      userId,
    };

    // Save to DB
    const newAd = new Ad(adData);
    await newAd.save();

    res.status(200).json({ message: 'Ad saved successfully', adData: newAd });
  } catch (err) {
    console.error('Error in POST /api/ads:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ads1/:id', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Entered here');
    console.log(req.params.id);

    const {
      companyId,
      categoryid,
      addressid,
      pettypeid,
      adtitle,
      addescription,
      userId,
      images: existingImages, // images passed in the body (could be URLs)
    } = req.body;
    console.log('Entered here1');
    // Map newly uploaded images to URLs
    const uploadedImageUrls = req.files.map(file => `/uploads/${file.filename}`);
    console.log('existingImages' + existingImages)
    console.log('uploadedImageUrls' + uploadedImageUrls)
    const imageArray1 = typeof existingImages === 'string' ? existingImages.split(',') : (Array.isArray(existingImages) ? existingImages : []);
    const uploadedImageUrls1 = typeof existingImages === 'string' ? existingImages.split(',') : (Array.isArray(uploadedImageUrls) ? uploadedImageUrls : []);
    // If there are existing images (URLs), keep them and add to the list
    const allImages = [
      ...(imageArray1 || []),  // Include existing images
      ...(uploadedImageUrls1 || [])  // Ensure uploadedImageUrls is an array (default to empty array if undefined or null)
    ];
    const allImages1 = typeof existingImages === 'string' ? existingImages.split(',') : (Array.isArray(allImages) ? allImages : []);
    console.log('allImages  ' + allImages1)
    const adData = {
      companyId,
      categoryid,
      addressid,
      pettypeid,
      adtitle,
      addescription,
      images: allImages,  // Combine existing URLs with new ones
      userId,
    };
    console.log(adData)
    // Update the ad document with the new adData
    const updatedAd = await Ad.findByIdAndUpdate(req.params.id, adData, { new: true });

    if (!updatedAd) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.status(200).json({ message: 'Ad updated successfully', adData: updatedAd });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backend code (Node.js/Express) - Example API to get ads by category and pettype
app.get('/api/adselected', async (req, res) => {
  try {
    const { categoryid, pettypeid } = req.query;

    // Find ads that match category and pet type, and populate category, pettype, and companyId
    const ads = await Ad.find({
      categoryid: categoryid,
      pettypeid: pettypeid,
      adclose: false
    })
      .populate('categoryid') // Populate category details
      .populate('pettypeid') // Populate pettype details
      .populate('companyId', 'companyname') // Populate companyId to get companyName (assuming you want only companyName field)
      .populate('addressid') // Populate address details
      .exec();

    res.json(ads); // Return the fetched ads with populated fields
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/adsingle/:id', async (req, res) => {
  try {
    const adId = req.params.id;
    const ad = await Ad.findById(adId)
      .populate('companyId')
      .populate('addressid')
      .exec();

    if (!ad) {
      return res.status(404).send('Ad not found');
    }

    res.json(ad);
  } catch (error) {
    console.error('Error fetching ad details:', error);
    res.status(500).send('Server error');
  }
});

app.post('/api/save/:type', async (req, res) => {
  try {
    const Data = req.body;
    const type = req.params.type; // Get the _id from the URL parameter
    console.log('ss')
    if (type == "Address") {
      // If no duplicate, create and save the address
      const address = new Address(Data);
      await address.save();
      console.log('Data saved:', address);
      res.status(201).json(address);
    }
    else if (type == "Pettype") {
      const existingCompany = await Pettype.findOne({});

      const newPettype = new Pettype(Data); // <- changed variable name
      await newPettype.save();
      console.log('Data saved:', newPettype);
      res.status(201).json(newPettype);
    }
    else if (type == "Company") {
      const existingCompany = await Company.findOne({});

      const newCompany = new Company(Data); // <- changed variable name
      await newCompany.save();
      console.log('Data saved:', newCompany);
      res.status(201).json(newCompany);
    }
    else if (type == "Ad") {
      // If no duplicate, create and save the address
      console.log("Here");
      const ad = new Ad(Data);
      await ad.save();
      res.status(201).json(ad);
    }
    else if (type == "Aboutus") {
      // If no duplicate, create and save the address
      const ad = new Aboutus(Data);
      await ad.save();
      res.status(201).json(ad);
    }
  } catch (err) {
    console.log(err);
  }
});

app.put('/api/update/:id/:type', async (req, res) => {
  try {
    const Data = req.body;
    const Id = req.params.id; // Get the _id from the URL parameter
    const type = req.params.type; // Get the _id from the URL parameter
    if (type == "Address") {
      const existing = await Address.findOne({
        _id: Id,
      });

      if (existing) {
        const updatedAddress = await Address.findByIdAndUpdate(existing._id, Data, { new: true });
        res.json(updatedAddress);
      }
      else {
        const Address1 = new Address(Data);
        await Address.save();
        res.status(201).json(Address);
      }
    }
    else if (type == "Company") {
      if (Id) {
        console.log(Data);
        const existingCompany = await Company.findOne({
          _id: { $ne: Id }, // Exclude the current document being updated
          companyname: Data.companyname
        });
        // console.log(existingAddress);
        if (existingCompany) {
          console.log("err");
          return res.status(400).json({ error: 'Duplicte company data' });
        }
        // If an _id is provided, it's an update; find and update the existing address
        const updatedCompany = await Company.findByIdAndUpdate(Id, Data, { new: true });
        console.log(updatedCompany);
        res.json(updatedCompany);
      } else {
        // If no _id is provided, it's a new address; create and save a new address
        const newCompany = new Company(Data);
        await newCompany.save();
        res.status(201).json(newCompany);
      }
    }
    else if (type == "Ad") {
      if (Id) {
        // If an _id is provided, it's an update; find and update the existing address
        const updatedAddress = await Ad.findByIdAndUpdate(Id, Data, { new: true });
        console.log(updatedAddress);
        res.json(updatedAddress);
      } else {
        // If no _id is provided, it's a new address; create and save a new address
        const newAd = new Ad(Data);
        await newAd.save();
        res.status(201).json(Address);
      }
    }
    else if (type == "Aboutus") {
      console.log('data id ' + Id);
      const existing = await Aboutus.findOne({
        _id: Id,
      });
      console.log(existing);
      if (existing) {
        console.log("update");
        const updatedAddress = await Aboutus.findByIdAndUpdate(existing._id, Data, { new: true });
        res.json(updatedAddress);
      }
      else {
        console.log(Data);
        const Aboutusa = new Aboutus(Data);
        await Aboutusa.save();
        res.status(201).json(Aboutusa);
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

// Get all addresses
app.get('/api/getdata/:filter/:type/:userId', async (req, res) => {
  try {
    //console.log('code reach service')
    //const filter = req.query.filter; // Get the filter parameter from the request
    const filter = req.params.filter; // Get the _id from the URL parameter
    const type = req.params.type; // Get the _id from the URL parameter
    const userIds = req.params.userId; // Get the _id from the URL parameter
    //console.log("reach here getdata")
    if (type == "Address") {
      if (filter === '-1') {
        Data = await Address.find({ userId: userIds });
      }
      // If filter is a valid ObjectId, return one company
      else if (Types.ObjectId.isValid(filter)) {
        Data = await Address.findOne({ _id: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      return res.json(Data);
    }
    else if (type == "Ad") {
      if (filter === '-1') {
        const data1 = await Ad.find({ userId: userIds })
          .populate('companyId', 'companyname') // Add this line
          .populate('addressid', 'addresstype') // Populate the 'address' field
          .populate('pettypeid', 'type') // Populate the 'pettype' field
          .populate('categoryid', 'categoryname') // Populate the 'category' field
          .exec();
        console.log("Enter");
        console.log(data1);
        res.json(data1);
      }
      else {
        const data2 = await Ad.find({ _id: filter })
          .populate('companyId', 'companyname') // Add this line
          .populate('addressid', 'addresstype') // Populate the 'address' field
          .populate('pettypeid', 'type') // Populate the 'pettype' field
          .populate('categoryid', 'categoryname') // Populate the 'category' field
          .exec();
        console.log(data2);
        res.json(data2);
      }
    }
    if (type === 'Company') {
      // If filter is '1', return all companies
      if (filter === '-1') {
        Data = await Company.find({ userId: userIds });
      }
      // If filter is a valid ObjectId, return one company
      else if (Types.ObjectId.isValid(filter)) {
        Data = await Company.findOne({ _id: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      return res.json(Data);
    }
    if (type === 'User') {
      // If filter is '1', return all companies
      if (filter === '-1') {
        Data = await User.find();
      }
      // If filter is a valid ObjectId, return one company
      else if (filter == filter) {
        Data = await User.findOne({ mobileno: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      return res.json(Data);
    }
    else if (type == "Aboutus") {
      // If filter is '1', return all companies
      if (filter === '-1') {
        Data = await Aboutus.find();
      }
      // If filter is a valid ObjectId, return one company
      else if (Types.ObjectId.isValid(filter)) {
        Data = await Aboutus.findOne({ companyId: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      return res.json(Data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/adclose/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adclose } = req.body; // expect { adclose: true } or false
    console.log('enter close')
    const updatedAd = await Ad.findByIdAndUpdate(
      id,
      { adclose },
      { new: true }
    );

    if (!updatedAd) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.status(200).json({ message: `Ad marked as ${adclose ? 'closed' : 'open'}`, ad: updatedAd });
  } catch (err) {
    console.error('Error updating ad status:', err);
    res.status(500).json({ message: 'Failed to update ad status' });
  }
});

app.get('/api/getdatatoken/:filter/:type', authenticateToken, async (req, res) => {
  try {
    //console.log('code reach service')
    //const filter = req.query.filter; // Get the filter parameter from the request
    const filter = req.params.filter; // Get the _id from the URL parameter
    const type = req.params.type; // Get the _id from the URL parameter
    //console.log("reach here getdata")
    if (type == "Address") {
      if (filter === '-1') {
        Data = await Address.find();
      }
      // If filter is a valid ObjectId, return one company
      else if (Types.ObjectId.isValid(filter)) {
        Data = await Address.findOne({ _id: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      return res.json(Data);
    }
    else if (type == "Ad") {
      if (filter === '-1') {
        const data1 = await Ad.find()
          .populate('companyId', 'companyname') // Add this line
          .populate('addressid', 'addresstype') // Populate the 'address' field
          .populate('pettypeid', 'type') // Populate the 'pettype' field
          .populate('categoryid', 'categoryname') // Populate the 'category' field
          .exec();
        console.log("Enter");
        console.log(data1);
        res.json(data1);
      }
      else {
        const data2 = await Ad.find({ _id: filter })
          .populate('companyId', 'companyname') // Add this line
          .populate('addressid', 'addresstype') // Populate the 'address' field
          .populate('pettypeid', 'type') // Populate the 'pettype' field
          .populate('categoryid', 'categoryname') // Populate the 'category' field
          .exec();
        console.log(data2);
        res.json(data2);
      }
    }
    if (type === 'Company') {
      // If filter is '1', return all companies
      if (filter === '-1') {
        Data = await Company.find();
      }
      // If filter is a valid ObjectId, return one company
      else if (Types.ObjectId.isValid(filter)) {
        Data = await Company.findOne({ _id: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      return res.json(Data);
    }
    if (type === 'User') {
      // If filter is '1', return all companies
      if (filter === '-1') {
        Data = await User.find();
      }
      // If filter is a valid ObjectId, return one company
      else if (filter == filter) {
        Data = await User.findOne({ mobileno: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      return res.json(Data);
    }
    else if (type == "Aboutus") {
      // If filter is '1', return all companies
      if (filter === '-1') {
        Data = await Aboutus.find();
      }
      // If filter is a valid ObjectId, return one company
      else if (Types.ObjectId.isValid(filter)) {
        Data = await Aboutus.findOne({ companyId: filter });
      }
      else {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      return res.json(Data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/delete/:id/:type', async (req, res) => {
  try {
    console.log('type');
    console.log('type' + " " + req.params.id);
    const Id = req.params.id; // Get the _id from the URL parameter
    const type = req.params.type; // Get the _id from the URL parameter
    //console.log(type + " " + Id);
    // Use Mongoose to delete the address by its _id
    if (type == "Address") {
      const result = await Address.deleteOne({ _id: Id });
      if (result.deletedCount > 0) {
        res.json({ message: `${result.deletedCount} address deleted successfully.` });
      } else {
        res.status(404).json({ error: 'No address found with the specified ID.' });
      }
    }
    if (type == "Company") {
      const addressCount = await Address.countDocuments({ companyId: Id });
      const adCount = await Ad.countDocuments({ companyId: Id });
      if (addressCount > 0 || adCount > 0) {
        console.log('here lol');
        return res.status(400).json({
          message: 'Cannot delete company. It is referenced in other collections.'
        });
      }
      const result = await Company.deleteOne({ _id: Id });
      if (result.deletedCount > 0) {
        res.json({ message: `${result.deletedCount} Company deleted successfully.` });
      } else {
        res.status(404).json({ error: 'No Company found with the specified ID.' });
      }
    }
    else if (type == "Ad") {
      const result = await Ad.deleteOne({ _id: Id });
      if (result.deletedCount > 0) {
        res.json({ message: `${result.deletedCount} Ad deleted successfully.` });
      } else {
        res.status(404).json({ error: 'No Ad found with the specified ID.' });
      }
    }
    else if (type == "Aboutus") {
      const result = await Aboutus.deleteOne({ _id: Id });
      if (result.deletedCount > 0) {
        res.json({ message: `${result.deletedCount} Ad deleted successfully.` });
      } else {
        res.status(404).json({ error: 'No Ad found with the specified ID.' });
      }
    }


  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/data/:filter/:type/:userId', async (req, res) => {
  try {
    console.log('here11')
    const type = req.params.type; // Get the _id from the URL parameter
    const filter = req.params.filter; // Get the _id from the URL parameter
    const userIds = req.params.userId; // Get the _id from the URL parameter
    console.log('here')
    let addressData = null;
    console.log('here1')
    if (type == "Ad") {
      if (filter != 'alldata')
        addressData = await Address.find({ userId: userIds });
      else
        addressData = await Address.find();

      const categoryData = await Category.find();
      const PettypeData = await Pettype.find().sort({ sortorder: 1 });

      const combinedData = {
        address: addressData,
        category: categoryData,
        pettype: PettypeData,
      };
      // console.log(combinedData);
      res.json(combinedData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

//this is a renaming of column code should comment after updation
app.get('/api/update', async (req, res) => {
  try {
    console.log("Reached here");
    await Ad.updateMany({}, { $rename: { "pettypeId": "pettypeid" } });
    await Ad.updateMany({}, { $rename: { "categoryId": "categoryid" } });
    await Ad.updateMany({}, { $rename: { "addressId": "addressid" } });
    await Ad.updateMany({}, { $unset: { telno: 1 } });
    res.json({ message: 'Field renamed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
