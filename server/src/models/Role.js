const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Role', RoleSchema);