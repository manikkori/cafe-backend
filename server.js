import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Sirf Frontend ko allow karenge
const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
};
const allowedOrigins = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
    origin: allowedOrigins, 
    methods: ['GET', 'POST', 'DELETE', 'PUT'], 
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Parse incoming JSON data

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ------------------------------------
// DATABASE SCHEMA & MODEL
// ------------------------------------
const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  guests: { type: Number, required: true }
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

// ------------------------------------
// API ROUTES
// ------------------------------------
app.post('/api/reservations', async (req, res) => {
  try {
    const newReservation = new Reservation(req.body);
    await newReservation.save();
    res.status(201).json({ message: 'Table reserved successfully! The Chef awaits.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reserve table.' });
  }
});
// Get all reservations (for admin purposes, not linked to frontend)
app.get('/api/reservations', async (req, res) => {
  try {
    // sort({ createdAt: -1 }) ka matlab latest booking sabse upar aayegi
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations.' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Reservation.findByIdAndDelete(id); 
    res.status(200).json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend running securely on port ${PORT}`);
});