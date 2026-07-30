export interface PricingTier {
  tier?: string;
  name: string;
  price: string;
  period?: string;
  features: string[];
  benefits: string[];
  highlight?: boolean;
  savings?: string;
  oneTime?: boolean;
}

export type AcademicSubcategory = "siwes" | "project" | "assignment" | "summary";

export const ACADEMIC_SUBCATEGORIES: { id: AcademicSubcategory; label: string }[] = [
  { id: "siwes", label: "SIWES Report" },
  { id: "project", label: "Project Writing" },
  { id: "assignment", label: "Assignment" },
  { id: "summary", label: "Report Summary" },
];

export const PRICING_DATA: {
  academic: Record<AcademicSubcategory, PricingTier[]>;
  signals: PricingTier[];
  bundles: PricingTier[];
  addons: PricingTier[];
} = {
  academic: {
    siwes: [
      {
        tier: "Tier 1",
        name: "SIWES Starter",
        price: "₦5,000",
        features: ["Week 1–4 Logbook summary", "Basic formatting", "1 Revision"],
        benefits: ["Affordable entry point for students", "Quick turnaround for short logbooks", "Perfect if you already have rough notes"],
      },
      {
        tier: "Tier 2",
        name: "SIWES Standard",
        price: "₦10,000",
        features: ["Week 1–12 Logbook", "Full formatting", "Plagiarism check", "2 Revisions"],
        benefits: ["Covers 3 months of industrial training", "Plagiarism-free guarantee included", "More revision rounds for perfection"],
      },
      {
        tier: "Tier 3",
        name: "SIWES Premium",
        price: "₦15,000",
        features: ["Week 1–24 Logbook", "Advanced formatting", "Plagiarism check", "Unlimited revisions", "Cover page design"],
        benefits: ["Complete 6-month SIWES coverage", "Unlimited edits until supervisor approves", "Professional cover page included"],
        highlight: true,
      },
    ],
    project: [
      {
        tier: "Tier 1",
        name: "Project Lite",
        price: "₦15,000",
        features: ["3,000–5,000 words", "1 chapter", "Basic formatting", "1 Revision"],
        benefits: ["Ideal if you're stuck on one chapter", "Budget-friendly for partial help", "Fast delivery on short sections"],
      },
      {
        tier: "Tier 2",
        name: "Project Standard",
        price: "₦25,000",
        features: ["8,000–12,000 words", "3 chapters", "Full formatting", "Plagiarism check", "2 Revisions"],
        benefits: ["Covers the core body of your project", "Plagiarism check ensures originality", "Suitable for most undergrad projects"],
      },
      {
        tier: "Tier 3",
        name: "Project Premium",
        price: "₦40,000",
        features: ["15,000–25,000 words", "Complete 5 chapters", "Advanced formatting", "Plagiarism check", "Unlimited revisions", "Data analysis"],
        benefits: ["Full project written from scratch", "SPSS/Excel data analysis included", "Unlimited edits until final approval"],
        highlight: true,
      },
    ],
    assignment: [
      {
        tier: "Tier 1",
        name: "Assignment Basic",
        price: "₦5,000",
        features: ["1 Subject", "Up to 1,500 words", "Basic research", "1 Revision"],
        benefits: ["Lowest price for quick assignments", "Great for short essays or Q&A", "Fast turnaround when deadline is near"],
      },
      {
        tier: "Tier 2",
        name: "Assignment Standard",
        price: "₦8,000",
        features: ["1–2 Subjects", "Up to 3,000 words", "In-depth research", "Plagiarism check", "2 Revisions"],
        benefits: ["Handle multiple subjects at once", "In-depth research with credible sources", "Plagiarism protection included"],
      },
      {
        tier: "Tier 3",
        name: "Assignment Premium",
        price: "₦12,000",
        features: ["1–3 Subjects", "Up to 5,000 words", "In-depth research", "Plagiarism check", "Unlimited revisions", "Referencing (APA/MLA/Harvard)"],
        benefits: ["Up to 3 subjects in one package", "Professional referencing formatting", "Unlimited revisions for perfect grades"],
        highlight: true,
      },
    ],
    summary: [
      {
        tier: "Tier 1",
        name: "Summary Basic",
        price: "₦5,000",
        features: ["Up to 10 pages summarized", "Bullet-point format", "1 Revision"],
        benefits: ["Quick digest of short articles", "Easy bullet-point scanning", "Affordable for small summaries"],
      },
      {
        tier: "Tier 2",
        name: "Summary Standard",
        price: "₦8,000",
        features: ["Up to 30 pages summarized", "Structured format", "Key insights", "2 Revisions"],
        benefits: ["Structured breakdown by sections", "Key insights highlighted for you", "Great for literature reviews"],
      },
      {
        tier: "Tier 3",
        name: "Summary Premium",
        price: "₦12,000",
        features: ["Up to 100 pages summarized", "Executive summary + breakdown", "Unlimited revisions", "Presentation slides (optional)"],
        benefits: ["Condense 100 pages into minutes", "Executive summary + detailed notes", "Optional slides for presentations"],
        highlight: true,
      },
    ],
  },
  signals: [
    {
      tier: "Tier 1",
      name: "Signals Starter",
      price: "₦10,000",
      period: "/month",
      features: ["3–5 signals/week", "Telegram access", "Basic market updates"],
      benefits: ["Low-risk entry for new traders", "Test signal quality before scaling", "Basic market context provided"],
    },
    {
      tier: "Tier 2",
      name: "Signals Pro",
      price: "₦20,000",
      period: "/month",
      features: ["Daily signals (5–7/week)", "Telegram VIP access", "Weekly report", "Entry/Exit/SL/TP levels"],
      benefits: ["Daily opportunities every trading day", "Full risk management with SL/TP", "Weekly performance tracking"],
    },
    {
      tier: "Tier 3",
      name: "Signals Elite",
      price: "₦35,000",
      period: "/month",
      features: ["Unlimited daily signals", "Private Telegram group", "Daily + Weekly reports", "1-on-1 consultation (30 min/week)", "Risk management guide"],
      benefits: ["Unlimited signals + private group", "Weekly 1-on-1 analyst coaching", "Personalized risk management plan"],
      highlight: true,
    },
  ],
  bundles: [
    {
      tier: "Tier 1",
      name: "Student Starter",
      price: "₦8,000",
      features: ["2 Assignments", "1 Report Summary"],
      benefits: ["Save ₦7,000 vs buying separately", "Perfect for mid-semester workload", "Covers essays and summaries"],
      savings: "Save ₦7,000 (47% off)",
    },
    {
      tier: "Tier 2",
      name: "Student Pro",
      price: "₦15,000",
      features: ["3 Assignments", "1 SIWES Report", "1 Report Summary"],
      benefits: ["Save ₦15,000 vs individual pricing", "All-in-one semester support", "Includes SIWES + assignments"],
      savings: "Save ₦15,000 (50% off)",
    },
    {
      tier: "Tier 3",
      name: "Student Ultimate",
      price: "₦25,000",
      features: ["5 Assignments", "Full SIWES Report", "1 Project Chapter", "Unlimited summaries"],
      benefits: ["Save ₦30,000+ vs buying separately", "Final-year student lifesaver", "Unlimited summaries for research"],
      savings: "Save ₦30,000+ (55% off)",
      highlight: true,
    },
  ],
  addons: [
    {
      name: "Extra Revision",
      price: "₦1,500",
      features: ["1 additional revision round"],
      benefits: ["Extend any package's revision limit", "Affordable peace of mind"],
      oneTime: true,
    },
    {
      name: "Rush Delivery",
      price: "₦3,000",
      features: ["24–48 hour turnaround"],
      benefits: ["Skip the queue for urgent deadlines", "Guaranteed fast delivery"],
      oneTime: true,
    },
    {
      name: "Plagiarism Check",
      price: "₦2,000",
      features: ["Standalone originality report"],
      benefits: ["Verify your own work before submission", "Full plagiarism percentage report"],
      oneTime: true,
    },
    {
      name: "PowerPoint Slides",
      price: "₦5,000",
      features: ["Per 10 slides"],
      benefits: ["Convert reports into presentations", "Professional slide design"],
      oneTime: true,
    },
    {
      name: "Data Analysis / SPSS",
      price: "₦8,000",
      features: ["Statistical analysis"],
      benefits: ["SPSS or Excel data processing", "Charts and interpretation included"],
      oneTime: true,
    },
    {
      name: "Referencing & Citation Fix",
      price: "₦2,500",
      features: ["APA / MLA / Harvard / Chicago"],
      benefits: ["Fix all citations in one go", "Ensure consistent referencing style"],
      oneTime: true,
    },
  ],
};
