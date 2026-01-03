# SummarAIze

SummarAIze is an AI-powered document assistant that allows you to upload, chat with, and analyze your documents. It leverages advanced AI to provide summaries, insights, and even generate presentations from your content.

## 🚀 Features

- **Document Chat**: Interactively chat with your PDF documents using AI.
- **Smart Summaries**: Get instant summaries and key takeaways from your files.
- **AI Insights**: Extract deep insights and action items.
- **Presentation Generation**: Automatically create PowerPoint presentations based on your documents.
- **Rich Text Editor**: Integrated editor using Plate.js for content creation.
- **Secure Authentication**: User management powered by Kinde Auth.
- **Subscription Plans**: Free and Pro tiers managed via Stripe.
- **File Management**: Efficient file uploads and storage using UploadThing.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Kinde](https://kinde.com/)
- **AI & Vectors**: [OpenAI](https://openai.com/), [LangChain](https://js.langchain.com/), [Pinecone](https://www.pinecone.io/)
- **Payments**: [Stripe](https://stripe.com/)
- **File Storage**: [UploadThing](https://uploadthing.com/)
- **API**: [tRPC](https://trpc.io/)
- **Rate Limiting**: [Upstash Redis](https://upstash.com/)

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database (Supabase recommended)
- API Keys for (Kinde, OpenAI, Pinecone, UploadThing, Stripe)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/SummarAIze.git
    cd SummarAIze
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory and add the necessary environment variables:

    ```env
    DATABASE_URL=
    DIRECT_URL=

    KINDE_CLIENT_ID=
    KINDE_CLIENT_SECRET=
    KINDE_ISSUER_URL=
    KINDE_SITE_URL=
    KINDE_POST_LOGOUT_REDIRECT_URL=
    KINDE_POST_LOGIN_REDIRECT_URL=

    OPENAI_API_KEY=
    PINECONE_API_KEY=

    UPLOADTHING_SECRET=
    UPLOADTHING_APP_ID=

    STRIPE_SECRET_KEY=
    STRIPE_WEBHOOK_SECRET=

    UPSTASH_REDIS_REST_URL=
    UPSTASH_REDIS_REST_TOKEN=
    ```

4.  Push the database schema:

    ```bash
    npx prisma db push
    ```

5.  Run the development server:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase.
- `npm run format`: Formats the code using Prettier.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## 📄 License

This project is licensed under the MIT License.
