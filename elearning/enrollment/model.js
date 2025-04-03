import mongoose from "mongoose";
import enrollmentSchema from "./schema.js";

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
