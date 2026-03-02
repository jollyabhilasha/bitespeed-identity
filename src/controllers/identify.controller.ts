import { Request, Response } from "express";
import { identifyContact } from "../services/identify.service";

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    const result = await identifyContact(email, phoneNumber);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};