import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  isGroupChat: boolean;
  groupName?: string;
  messages: {
    sender: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
    isDeleted: boolean;
  }[];
  suspendedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    messages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isDeleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    suspendedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model<IChat>("Chat", chatSchema);
export { Chat };