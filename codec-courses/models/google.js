const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    picture: String,
});
const GoogleUser = mongoose.model('GoogleUser', userSchema);