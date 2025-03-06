# Next.js Chat Application

A simple Next.js chat application with two different chatbots and an admin dashboard.

## Features

- Two different chatbots:
  - Bot #1: Uses standard OpenAI API
  - Bot #2: Uses OpenAI Assistant API
- Session management that persists for 7 days
- Admin dashboard to view all conversations
- SQLite database for storing messages and conversations
- Authentication for admin access

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone this repository or download the source code
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your OpenAI API key and Assistant ID:

```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=your_assistant_id_here
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Usage

- Visit http://localhost:3000 to access the landing page
- Click on "Chat with Bot #1" or "Chat with Bot #2" to start chatting
- Your chat history will be saved for 7 days
- Visit http://localhost:3000/admin/login to access the admin dashboard
- Default admin credentials:
  - Username: admin
  - Password: admin123

## Tech Stack

- Next.js for frontend and API routes
- Tailwind CSS for styling
- SQLite for database (easy to replace with another database)
- OpenAI API for chat functionality

## Database Configuration

The application uses SQLite by default for simplicity. If you want to use a different database:

1. Update the database connection in `/lib/db.js`
2. Install the required database driver package
3. Modify the database queries as needed

## Session Management

Sessions are managed using browser cookies that expire after 7 days. Conversations in the database are also automatically deleted after 7 days.
