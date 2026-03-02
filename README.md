# Bitespeed Backend Task - Identity Reconciliation

## 📌 Overview

This project implements the **Identity Reconciliation** service for Bitespeed.

The system links multiple purchases made using different email addresses and phone numbers to a single customer identity.

The `/identify` endpoint consolidates contacts by:
- Creating new primary contacts when no match exists
- Creating secondary contacts when new information appears
- Merging multiple primary contacts when required
- Returning a unified contact response

---

## 🛠 Tech Stack

- Node.js
- TypeScript
- Express.js
- MySQL
- Prisma ORM

---

## 🗄 Database Schema

Contact table structure:

```ts
{
  id: number
  phoneNumber: string | null
  email: string | null
  linkedId: number | null
  linkPrecedence: "primary" | "secondary"
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime | null
}
```

- The oldest contact in a group is marked as `primary`
- All others are marked as `secondary`
- Secondary contacts reference the primary using `linkedId`

---

## 🚀 API Endpoint

### POST `/identify`

### Request Body (JSON)

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

At least one field must be provided.

---

### Response Format

```json
{
  "contact": {
    "primaryContactId": number,
    "emails": string[],
    "phoneNumbers": string[],
    "secondaryContactIds": number[]
  }
}
```

---

## 🧠 Logic Summary

The service performs:

1. Search for contacts matching email or phoneNumber
2. If no match → create new primary contact
3. If match exists:
   - Identify the oldest primary
   - Convert other primaries to secondary if needed
   - Create secondary if new information is introduced
4. Return consolidated response

---

## 🧪 Example

### Request

```json
{
  "email": "alpha@gmail.com",
  "phoneNumber": "555555"
}
```

### Response

```json
{
  "contact": {
    "primaryContactId": 9,
    "emails": [
      "alpha@gmail.com",
      "beta@gmail.com"
    ],
    "phoneNumbers": [
      "555555",
      "666666"
    ],
    "secondaryContactIds": [
      10
    ]
  }
}
```

---

## ⚙️ Local Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/jollyabhilasha/bitespeed-identity
cd bitespeed-identity
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Setup MySQL

- Install XAMPP
- Start MySQL
- Create database named:

```
bitespeed
```

---

### 4️⃣ Configure Environment Variables

Create `.env` file:

```
DATABASE_URL="mysql://root:@localhost:3306/bitespeed"
```

---

### 5️⃣ Run Prisma Migration

```bash
npx prisma migrate dev --name init
```

---

### 6️⃣ Start Server

```bash
npx ts-node-dev src/index.ts
```

Server runs at:

```
http://localhost:3000
```

---

## 🌍 Live Deployment

Live Endpoint:

```
https://your-app-name.onrender.com/identify
```

---

## 📂 Project Structure

```
src/
 ├── controllers/
 ├── services/
 ├── routes/
 ├── utils/
 └── index.ts

prisma/
 ├── schema.prisma
 └── migrations/
```

---

## ✅ Edge Cases Covered

- New contact creation
- Secondary contact creation
- Primary to secondary conversion
- Multiple linked contacts consolidation
- Handling partial input (email or phoneNumber)

---

