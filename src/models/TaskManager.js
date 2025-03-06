import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true },
  employee: { type: mongoose.Types.ObjectId, ref: 'User' },
  description:{type: String, required: true, trim: true},
  creationDate: { type: Date, default: Date.now }, 
  hoursWorked: { type: Number, required: true, min: 0 },
  status: {type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending'},
  remark: {type: String, trim: true},
  remarkBy: { type: mongoose.Types.ObjectId, ref: 'User' },

},{timestamps: true})

const Task = mongoose.model("Task", taskSchema);
export default Task;