

## 

# CareerTwin


*Your Personalized AI Career Co-pilot, built with Next.js and Google Cloud.*

-----

## 🚀 Overview

CareerTwin is an intelligent, AI-powered platform that serves as a personal career co-pilot for students. It addresses the overwhelming number of career choices and the lack of personalized guidance by transforming career anxiety into a clear, actionable plan. The platform guides users through a complete journey of self-discovery, skill development, and job-readiness.

  - **AI-Powered Self-Discovery:** Ingests a resume or LinkedIn profile to analyze skills and suggest tailored career paths.
  - **Personalized Roadmaps:** Generates dynamic, step-by-step plans with courses and projects to build skills for a target career.
  - **Interview Coaching:** Conducts mock interviews in a distraction-free 'Focus Mode' and provides instant, actionable feedback.
  - **Modern, Student-Focused UI:** A seamless user journey from career discovery to interview confidence.

-----

## 🛠️ Tech Stack

  - **Framework**: Next.js 14 (App Router)
  - **AI & Cloud**: Google Cloud Stack (Vertex AI Gemini, Cloud Run, Firestore)
  - **UI Components**: Shadcn/UI + Radix UI
  - **Styling**: Tailwind CSS
  - **Language**: TypeScript
  - **Animations**: Framer Motion

-----

## 🧱 Project Structure

The project has been refactored to focus exclusively on the student journey.

```
careertwin/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Main Student Dashboard
│   ├── analyze/          # Resume & JD Analysis page
│   ├── roadmap/          # Career Roadmap generation page
│   ├── take-interview/   # Mock Interview 'Focus Mode'
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Home/Landing page
├── components/           # Reusable components
│   ├── layout/           # Layout components
│   │   └── MainLayout.tsx
│   ├── ui/               # UI components
│   └── ...               # Other shared components
├── lib/                  # Utility functions (e.g., auth)
└── public/               # Static assets
```

-----

## ⚙️ Getting Started

### Prerequisites

  - Node.js 18+
  - npm, yarn, or pnpm
  - Google Cloud SDK (`gcloud`)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/UdhayanithiM/fortitwin.git
    cd fortitwin
    ```

2.  **Install dependencies**

    ```bash
    npm install       # or
    yarn install      # or
    pnpm install
    ```

3.  **Setup Environment Variables**

      - Create a `.env.local` file in the root directory.
      - Add your Google Cloud Project ID, Service Account credentials, and Database URLs.

4.  **Run the development server**

    ```bash
    npm run dev       # or
    pnpm dev
    ```

5.  **Open your browser**
    [Visit http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

-----

## 🎯 Key Features

  - **AI Skills Analysis:** Upload a resume and job description to get a detailed analysis of your strengths, skill gaps, and an ATS score.
  - **Dynamic Career Roadmap:** Select a career path and receive a personalized, step-by-step plan with recommended courses and portfolio projects.
  - **AI Interview Coach:** Practice mock interviews tailored to your target role in a distraction-free 'Focus Mode'.
  - **Actionable Feedback:** Receive instant, constructive feedback after each interview to improve your answers and build confidence.
  - **Personalized Dashboard:** Track your progress, review your roadmaps, and access your interview history from a central hub.

-----

## 📬 Contact
udhayanithi@gmail.com
