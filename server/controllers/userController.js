import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import razorpay from 'razorpay'
import transactionModel from "../models/transactionModel.js";


// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Login existing user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get user's credits
const userCredits = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      credits: user.creditBalance, // IMPORTANT: must be named `credits` for frontend
      user: { name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async(req, res)=>{
  try {
    const {userId, planId} = req.body

    const userData = await userModel.findById(userId)

    if(!userId || !planId) {
      return res.json({success: false, message: 'Missing Details!' })
    }

    let credits, plan, amount, date 
    switch (planId) {
      case 'Basic':
        plan = 'Basic'
        credits = 100
        amount = 10
        break;

        case 'Advanced':
        plan = 'Advanced'
        credits = 500
        amount = 50
        break;

        case 'Business':
        plan = 'Business'
        credits = 5000
        amount = 250
        break;
        

    
      default:
        return res.json({success: false, message: 'Plan not found'});
    }

    date = Date.now();

    const transactionData = {
      userId, plan, amount, credits, date
    }

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: newTransaction._id,
    }

    const newTransaction = await transactionModel.create(transactionData)

    await razorpayInstance.orders.create(options, (error, order) =>{
      if(error) {
        console.log(error);
        return res.json({success: false, message: error})
        
      }
      res.json({success: true, order})
    })

  } catch (error) {
    console.log(error)
    res.json({success: false, message:error.message})
    
  }
}


export { registerUser, loginUser, userCredits , paymentRazorpay};
