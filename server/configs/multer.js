import multer from "multer";

// Configure multer storage 
const storage = multer.diskStorage({})

const upload = multer({storage})

export default upload