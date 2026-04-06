const mongoose = require('mongoose');

const ExtensionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Extension name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  prompt: {
    type: String,
    required: [true, 'Prompt is required']
  },
  version: {
    type: String,
    default: '0.0.1'
  },
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['snippet', 'theme', 'language', 'debugger', 'formatter', 'linter', 'keybinding', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['generating', 'ready', 'failed'],
    default: 'generating'
  },
  files: {
    packageJson: { type: String, default: '' },
    extensionJs: { type: String, default: '' },
    readmeMd: { type: String, default: '' },
    changelogMd: { type: String, default: '' },
    vscodeLaunchJson: { type: String, default: '' },
    vscodeTasksJson: { type: String, default: '' }
  },
  tags: [{
    type: String,
    trim: true
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ExtensionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Extension', ExtensionSchema);
