# Bitespeed Identity Reconciliation Service

This service helps identify and track customer identities across multiple purchases by linking contact information (email and phone numbers) in a relational database.

## Features

- Identify and link customer contacts based on email and phone number
- Maintain primary and secondary contact relationships
- Handle contact consolidation and updates
- RESTful API endpoint for contact identification

## Tech Stack

- Node.js with TypeScript
- Express.js for the web server
- PostgreSQL for the database
- TypeORM for database operations

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=bitespeed
   PORT=3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /identify

Identifies and links customer contacts based on provided email and phone number.

**Request Body:**
```json
{
  "email": "string",
  "phoneNumber": "string"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": number,
    "emails": string[],
    "phoneNumbers": string[],
    "secondaryContactIds": number[]
  }
}
```

### GET /identify
Retrieves the consolidated contact info for a given email or phone number.

**Query Parameters:**
- `email` (optional)
- `phoneNumber` (optional)

**Example:**
```
GET /identify?email=george@hillvalley.edu
```

**Response:**
Same as POST /identify.

### PUT /identify
Updates an existing contact's email and/or phone number, then returns the consolidated contact info.

**Request Body:**
```json
{
  "id": number,
  "email"?: "string",
  "phoneNumber"?: "string"
}
```

**Response:**
Same as POST /identify.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## License

MIT 