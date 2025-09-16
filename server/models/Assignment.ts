import mongoose, { Document, Schema } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dueDate: Date;
  totalPoints: number;
  submissions: {
    student: mongoose.Types.ObjectId;
    submittedAt: Date;
    grade?: number;
    feedback?: string;
    fileUrl?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    submissions: [
      {
        student: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        grade: {
          type: Number,
          min: 0,
        },
        feedback: {
          type: String,
        },
        fileUrl: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IAssignment>("Assignment", assignmentSchema);
