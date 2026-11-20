import mongoose, { Schema } from "mongoose";
import { AvailableUserRolesEnum, UserRolesEnum } from "../utils/constant.js";

const ProjectMemberSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    role: { 
        type: String,
        enum: AvailableUserRolesEnum,
        default: UserRolesEnum.MEMBER,
        lowercase:true,
        trim:true
    }
}, { timestamps: true });

export const ProjectMember = mongoose.model("ProjectMember", ProjectMemberSchema);