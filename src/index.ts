import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import identifyRoute from "./routes/identify.route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send(`
    <h1> Bitespeed Identity Reconciliation Service</h1>
    <p>Status: Running</p>
    <p>Use POST /identify to test the API.</p>
  `);
});
app.use("/", identifyRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});