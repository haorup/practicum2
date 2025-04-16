import mongoose from "mongoose";
import enrollmentSchema from "./schema.js";

const Enrollment = mongoose.model("enrollment", enrollmentSchema);

export default Enrollment;
