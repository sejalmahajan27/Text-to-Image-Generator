import axios from "axios";
import userModel from "../models/userModel.js";
import FormData from "form-data";

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.userId; // ✅ From middleware

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.json({ success: false, message: 'Missing prompt' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.creditBalance <= 0) {
      return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
    }

    // ✅ Create and send FormData
    const formData = new FormData();
    formData.append('prompt', prompt);
    console.log("Generating image with prompt:", prompt); // Debug

    const { data } = await axios.post(
      'https://clipdrop-api.co/text-to-image/v1',
      formData,
      {
        headers: {
          'x-api-key': process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders() // ✅ Important for FormData
        },
        responseType: 'arraybuffer'
      }
    );

    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:image/png;base64,${base64Image}`;

    // ✅ Deduct credit
    await userModel.findByIdAndUpdate(userId, {
      $inc: { creditBalance: -1 }
    });

    res.json({
      success: true, // ✅ spelling fixed
      message: "Image Generated!",
      creditBalance: user.creditBalance - 1,
      resultImage
    });

  } catch (error) {
    console.error("Image Generation Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
