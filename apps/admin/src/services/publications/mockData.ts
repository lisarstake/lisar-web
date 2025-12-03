import { BlogPost, BlogCategory } from "@/types/blog";

// Simple mock categories reused across admin + blog
export const mockBlogCategories: BlogCategory[] = [
  {
    id: "1",
    name: "Getting Started",
    slug: "getting-started",
    description: "Short guides to help you begin with Lisar.",
  },
  {
    id: "2",
    name: "Announcements",
    slug: "announcements",
    description: "Product and platform updates from the team.",
  },
  {
    id: "3",
    name: "Community",
    slug: "community",
    description: "Stories and highlights from Lisar users.",
  },
];

// Very short, 3‑paragraph style sample posts for testing CRUD in the admin
export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with Lisar in 3 Minutes",
    slug: "getting-started-with-lisar",
    excerpt:
      "A quick overview of how to deposit, stake, and see your rewards on Lisar.",
    content: `
# Getting Started with Lisar in 3 Minutes

Lisar is designed so you can move from zero to staking in just a few clicks. Create an account, complete verification, and deposit the asset you want to stake.

Once your balance is available, pick a validator from the list, choose how much you want to stake, and confirm. Your staking position shows up immediately in your dashboard, along with your projected rewards.
    `,
    author: {
      name: "Lisar Team",
      avatar: "/Logo.svg",
      role: "Product",
    },
    coverImage: "/lisk1.png",
    category: "Getting Started",
    tags: ["Onboarding", "Basics"],
    publishedAt: "2024-11-25T09:00:00Z",
    readingTime: 2,
    featured: true,
    status: "published",
    createdAt: "2024-11-24T09:00:00Z",
    updatedAt: "2024-11-25T09:00:00Z",
  },
  {
    id: "2",
    title: "New: Public Staking Dashboard",
    slug: "new-public-staking-dashboard",
    excerpt:
      "We’ve shipped a simple dashboard that gives you a clean view of rewards, validators, and performance.",
    content: `
# New: Public Staking Dashboard

The Lisar dashboard now gives you a single place to see your total balance, rewards, and validator performance. It’s built to stay readable even when you add more networks over time.

You can quickly scan your positions, switch validators, or top up existing stakes, all from the same view without digging through multiple pages.
    `,
    author: {
      name: "Sarah Chen",
      role: "Product Marketing",
    },
    coverImage: "/earn1.jpeg",
    category: "Announcements",
    tags: ["Product", "Dashboard"],
    publishedAt: "2024-11-27T12:30:00Z",
    readingTime: 2,
    featured: false,
    status: "published",
    createdAt: "2024-11-26T12:30:00Z",
    updatedAt: "2024-11-27T12:30:00Z",
  },
  {
    id: "3",
    title: "How Lisa Uses Lisar to Keep Things Simple",
    slug: "how-lisa-uses-lisar",
    excerpt:
      "A quick look at how one community member uses Lisar to stake without overthinking it.",
    content: `
# How Lisa Uses Lisar to Keep Things Simple

Lisa keeps a single goal in mind: steadily grow her crypto without watching charts all day. She stakes a fixed amount every month across a few validators and checks the dashboard once a week.

By keeping her plan simple and consistent, she spends less time managing positions and more time focusing on work, family, and the projects she actually cares about.
    `,
    author: {
      name: "Jennifer Lopez",
      role: "Community",
    },
    coverImage: "/lisk.png",
    category: "Community",
    tags: ["Community", "Story"],
    publishedAt: "2024-11-28T16:00:00Z",
    readingTime: 2,
    featured: false,
    status: "published",
    createdAt: "2024-11-28T10:00:00Z",
    updatedAt: "2024-11-28T16:00:00Z",
  },
];

