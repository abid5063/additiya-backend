import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

// Debug: Log environment variables (remove in production)
console.log("Cloudinary Config Debug:");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing");
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;