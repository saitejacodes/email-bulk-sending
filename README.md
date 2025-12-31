# Bulk Email Sending System

A simple asynchronous bulk email sending system using Node.js, MongoDB, and Nodemailer.

## Features

- Send the same email to thousands of users without blocking the API
- MongoDB acts as a queue (PENDING → SENT status)
- Worker processes 50 emails every 5 seconds
- Non-blocking API response
- Simple, intern-level code

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Nodemailer
- Gmail SMTP

## Project Structure

```
index.js        → Express server + MongoDB connection
routes/send.js  → POST /send API (inserts emails only)
models/email.js → Email schema
worker.js       → Background email processor
.env           → Configuration
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure .env

Update your `.env` file with:

```
MONGODB_URI=your_mongodb_connection_string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
PORT=3000
```

**Note:** Use Gmail App Password, not your regular password.

### 3. Start the Server

```bash
node index.js
```

### 4. Start the Worker (separate terminal)

```bash
node worker.js
```

## API Usage

### Send Bulk Email

**Endpoint:** `POST /send`

**Request:**

```json
{
  "subject": "Announcement",
  "body": "Hello, this is a bulk email",
  "recipients": ["user1@gmail.com", "user2@gmail.com"]
}
```

**Response:**

```json
{
  "queued": 2
}
```

## How It Works

1. **API** inserts each recipient as a PENDING document in MongoDB
2. **API** returns immediately (non-blocking)
3. **Worker** runs every 5 seconds and:
   - Fetches max 50 PENDING emails
   - Sends each email via Nodemailer
   - Updates status to SENT

## Database Schema

```
emails
├── email (String, required)
├── subject (String, required)
├── body (String, required)
├── status (String: "PENDING" | "SENT")
└── createdAt (Date, auto-generated)
```

## Interview Summary

**Problem:** Send bulk emails without blocking the API

**Solution:**

- MongoDB stores emails with PENDING status
- Worker runs independently every 5 seconds
- Processes in batches of 50
- Updates status to SENT after sending

**Resume Line:**
Built an asynchronous bulk email sending system using Node.js and MongoDB to send emails to thousands of users using batch processing.

## License

ISC
