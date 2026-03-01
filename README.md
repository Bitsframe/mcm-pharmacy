# Supabase API Service

API endpoint to check if similar values exist in Supabase database.

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials
3. Set your table and column names

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoint

**POST** `/api/check`

Request:
```json
{
  "value": "string to check"
}
```

Response:
```json
{
  "success": true,
  "exists": true,
  "data": { /* matching record */ }
}
```

## Security Features

- Helmet for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation
- Error handling
