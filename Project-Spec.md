# Project Vision: FamilyOS 

## Core Philosophy
The main goal of this app (web and mobile) is to drastically reduce the cognitive load of managing a family. It serves as a centralized, automated "second brain" for family operations. The user experience must be frictionless, requiring minimal manual data entry.

## Tech Stack
- **Frontend:** Svelte (using SvelteKit for routing)
- **Backend / Database:** Convex (for real-time data syncing, file storage, and serverless functions)
- **Styling:** Tailwind CSS
- **AI Integration:** OpenAI API / Anthropic API (for document parsing)

## Key Features & Roadmap

### 1. The Central Database (Convex)
We need a highly secure, well-structured database to hold sensitive family data.
- **Financial Health:** Track credit scores, loan balances, and monthly budgets.
- **Document Vault:** Secure storage for PDFs, receipts, and contracts using Convex File Storage.
- **Household Entities:** Manage different family members and their specific tasks/data.

### 2. The "Bill Engine" (AI Document Processing)
This is the core automation feature. The user should not have to manually type out bill details.
- **Input:** User uploads a PDF or forwards an email to the system.
- **Processing:** An AI agent parses the document to extract: `Vendor Name`, `Amount Due`, `Due Date`, and `Payment Details`.
- **Storage:** The raw PDF is saved in Convex.
- **Action:** The system creates a "Pending Payment" record. (Future scope: One-click payment approval via banking APIs like Stripe/Plaid).

### 3. Analytics & Dashboards (Future Phase)
- Visualizing spending habits, bill trends, and credit score history using charting libraries (e.g., Chart.js or D3).
- A unified dashboard showing "What needs my attention this week."

---

## 🤖 Strict Instructions for the Cursor AI Agent

When generating code for this project, you must adhere to the following rules:

1. **Svelte Best Practices:** - Write modern SvelteKit code. 
   - Use standard `<script>` setup. 
   - Keep components small, modular, and reusable. 
   - Favor Svelte's reactive statements (`$:`) for derived state.

2. **Convex Best Practices:**
   - Define strict schemas in `convex/schema.ts` for all database tables to ensure data integrity.
   - Use internal mutations for sensitive operations that shouldn't be exposed directly to the frontend.
   - Handle file uploads using Convex's built-in file storage methods.

3. **Security & Privacy First:**
   - This app handles sensitive financial data. Never log sensitive information (like credit scores or full account numbers) to the console.
   - Ensure all database queries are scoped to the authenticated user/family ID.

4. **Iterative Development:**
   - Do not try to build the entire app at once. When I ask you to build a feature, scaffold the Convex backend logic first, then build the Svelte UI to consume it.