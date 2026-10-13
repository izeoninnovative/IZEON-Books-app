# IZEON Books - Academy Financial Accounting & ERP System
### Official Technical & Operational Documentation
**Version:** 2.0.0 | **Author:** IZEON Innovative Software Team | **Release:** October 2026

---

## 1. Executive Summary

**IZEON Books** is a specialized financial ERP and institute management platform developed for **IZEON INNOVATIVE** (Academy of Computer Software Training). The platform streamlines student admissions, course fees, flexible EMI installment scheduling, GST-compliant invoicing, operating expense management, payroll disbursement, and real-time Profit & Loss reporting.

The system enforces strict financial integrity rules to prevent accounting discrepancies, prevents excess fee collections, and automates multi-installment settlement lifecycles.

---

## 2. System Architecture & Tech Stack

### 2.1 Frontend Architecture (`IZEON-Books-app`)
- **Core Framework:** React 18+ with TypeScript
- **Build Tool:** Vite with Hot Module Replacement (HMR)
- **Styling:** Tailwind CSS v4 with custom brand tokens:
  - Brand Cobalt Blue: `#1656a6` / `#154E98`
  - Brand Crimson Red: `#8a252d`
  - Typography: *Plus Jakarta Sans* & *Inter*
- **Icons:** Lucide React
- **Routing:** React Router v6 (Protected & Role-Guarded routes)
- **State Management:**
  - `AuthContext`: Manages JWT tokens, authenticated sessions, user profiles, and roles (`ADMIN` / `HR`).
  - `NotificationContext`: Global Toast Notification System with auto-dismiss timers, countdown bars, and accessible queues.
- **HTTP Client:** Axios with JWT auto-injection interceptors.

### 2.2 Backend Architecture (`IZEON-Books-server`)
- **Runtime:** Node.js with Express.js (ES Modules)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL / SQLite with Prisma ORM
- **Security:**
  - JWT (JSON Web Tokens) for stateless authentication
  - Argon2/Bcrypt password hashing
  - Role-Based Access Control (RBAC) middleware (`verifyToken`, `requireRole`)
- **API Pattern:** RESTful JSON APIs organized cleanly into `controllers`, `services`, `routes`, and `middlewares`.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Module / Feature | Route | Admin Access | HR Staff Access |
| :--- | :--- | :---: | :---: |
| **Authentication & Login** | `/login` | Yes | Yes |
| **Dashboard KPIs** | `/` | Yes | Yes |
| **Student Directory & Search** | `/students` | Yes | Yes |
| **New Student Admission** | `/students/new` | Yes | Yes |
| **Student Ledger & Payment Collection** | `/students/:id` | Yes | Yes |
| **Invoices & Receipts Ledger** | `/invoices` | Yes | Yes |
| **Tax Invoice & Receipt Printing** | `/students/:id`, `/invoices` | Yes | Yes |
| **P&L Financial Reports** | `/reports` | Yes | ❌ Blocked |
| **Expense Recording** | `/reports` | Yes | ❌ Blocked |
| **Staff Salary Disbursement** | `/reports` | Yes | ❌ Blocked |
| **HR Staff Account Management** | `/hr-management` | Yes | ❌ Blocked |
| **Company Legal & GST Configuration** | `/settings` | Yes | ❌ Blocked |

---

## 4. Detailed Functional Modules

### 4.1 Authentication & Security
- **Endpoints:** `POST /api/auth/login`
- **Session Lifespan:** Secure token saved in client storage with automatic validation.
- **Access Guarding:** Protected route wrapper (`<ProtectedRoute />`) redirects unauthorized sessions directly to `/login`. Admin-only routes (`adminOnly={true}`) prevent HR staff from tampering with sensitive financial data.

### 4.2 Dashboard (`/`)
- Displays real-time financial snapshots:
  - **Total Revenue Collected** (Aggregate fee collections + down payments)
  - **Pending Balances** (Total outstanding student receivables)
  - **Active Admissions** (Currently enrolled students)
  - **Net Profit Inflow** (Income minus operational costs)
- Quick navigation shortcuts for high-frequency workflows.

### 4.3 Student Admission & Fee Structuring (`/students/new`)
1. **Student Demographics:** Captures Full Name, Unique Email, Phone Number, Date of Birth, and Address.
2. **Course Enrollment:** Automatically calculates base course fees and duration from the Course catalog.
3. **Billing Structure Options:**
   - **Lumpsum Plan:** Full payment upfront with optional promotional discount.
   - **EMI Installment Plan:** Down payment + Remaining balance divided across 2 to 12 monthly installments.
   - **GST Mode:** Automatically calculates 18% GST (9% CGST + 9% SGST) or non-GST fee invoices.
4. **Initial Invoice Generation:** Automatically generates Invoice #1 upon admission for down payment or lumpsum, recording transaction method (UPI, Cash, Card, NetBanking, Cheque) and reference ID.

### 4.4 Student Ledger, EMI Schedule & Smart Payment Engine (`/students/:id`)
- **Financial Status Progress:** Visual progress bar tracking percentage cleared vs remaining balance.
- **Detailed Tax Ledger:** Base Amount, Discount Amount, Taxable Amount, CGST (9%), SGST (9%), Total Amount, Paid Amount, and Balance.
- **EMI Installment Table:**
  - Lists every monthly installment with Due Date, Amount, Status (`Paid` / `Pending`), Paid Date, and Action.
- **Smart Payment Rules (Overpayment Prevention & Auto-Clear):**
  - **Excess Payment Rejection:** The system strictly rejects any payment attempt exceeding the student's remaining balance.
  - **Auto-Clear on Full Balance:** If a student pays off their remaining balance in a single installment, all subsequent pending EMI installments (#5, #6, etc.) are **automatically marked as PAID and Cleared** in the database.
  - **Quick Action Fillers:** Payment modal provides instant one-click buttons:
    - `[ Pay Due EMI ]` — Fills the standard installment amount.
    - `[ Pay Full Balance ]` — Fills the exact remaining balance for full fee closure.
  - **Auto-Healing Consistency:** Existing records where balance is zero automatically resolve lingering pending EMIs and sanitize any overflowed records.

### 4.5 Tax Invoices & Receipt Generation (`/invoices`)
- Complete audit trail of all transactions.
- **Sequential Invoicing:** Automated format `INV-YYYYMMDD-XXXX`.
- **Printable Modal Format:**
  - Header with IZEON INNOVATIVE logo, company tagline, address, and official 15-digit GSTIN.
  - Student details and course enrollment info.
  - Taxable value, CGST (9%), SGST (9%), and total payment breakdown.
  - Clean computer-generated format ready for browser printing or saving as PDF.

### 4.6 Profit & Loss Financial Reports (`/reports` - Admin Only)
- **Net Balance Analysis:**
  $$\text{Net Profit/Loss} = \text{Total Fee Revenue} - (\text{Operating Expenses} + \text{Staff Salaries})$$
- **Operational Expense Tracker:** Records overhead expenses categorized under Rent, Utilities, Marketing, Equipment, Maintenance, and Miscellaneous.
- **Payroll Management:** Tracks monthly trainer and staff salary disbursements with payment mode and bank transaction reference.
- Monthly and annual period filtering.

### 4.7 HR Account Management (`/hr-management` - Admin Only)
- Admin interface to create and manage HR credentials.
- Authorized HR accounts have full access to student admissions and receipt collections without exposing sensitive institute profits or expenses.

### 4.8 Company & GST Configuration (`/settings` - Admin Only)
- Configure Academy Legal Entity Name (`IZEON INNOVATIVE`).
- Tagline, Official Address, Contact Phone, and Email.
- 15-character GSTIN identifier with regex format validation.

### 4.9 Toast Notification System
- Real-time user feedback replacing native browser alerts.
- Animated floating container with auto-dismiss timers and linear countdown progress bars.
- Color codes:
  - **Success:** Emerald green with `CheckCircle2`
  - **Error:** Crimson red with `AlertOctagon`
  - **Warn:** Amber with `AlertTriangle`
  - **Info:** Cobalt blue with `Info`

---

## 5. Operational Guidelines for Academy Staff

1. **New Admission Workflow:**
   - Navigate to **New Admission**.
   - Input verified student phone number and email address.
   - Choose payment type. If EMI is selected, specify the agreed Down Payment and installment duration.
   - Confirm admission to immediately print the student's first payment receipt.

2. **Collecting Installments:**
   - Search the student under **Students** and open their ledger.
   - In the EMI table, click **Collect Fee** on the pending installment.
   - Choose **Pay Due EMI** for the regular installment or **Pay Full Balance** to settle all remaining fees at once.
   - Enter the payment method and reference number.
   - Click **Confirm & Generate Invoice** to complete payment and print the generated receipt.

3. **Printing / Re-Issuing Invoices:**
   - Go to **Invoices & Receipts** or scroll down to the student's history.
   - Click the **Receipt** button on the target invoice.
   - Use the **Print Invoice** button to print directly to thermal or A4 printer, or save as PDF.

---
*© 2026 IZEON INNOVATIVE. All rights reserved.*
