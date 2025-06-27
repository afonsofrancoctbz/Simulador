# **App Name**: TributaSimples

## Core Features:

- Data Input: User inputs monthly revenue, including domestic and export revenue, payroll details (total salary expense and pro-labore for partners), business activity (CNAE), and municipal ISS rate.
- Simples Nacional Calculation: Calculates taxes under Simples Nacional, considering RBT12, effective tax rate, Fator R, and annexes (III, IV, V). Accounts for ISS and PIS/COFINS exemptions for export revenue and INSS payroll.
- Lucro Presumido Calculation: Calculates taxes under Lucro Presumido, using a presumed profit base, calculating PIS, COFINS, IRPJ, CSLL, and ISS. Includes considerations for export revenue exemptions. Calculation of INSS payroll is included.
- Pro-labore Taxes Calculation: Calculates INSS (11%) and IRRF based on progressive tax rates.
- Comparative Dashboard: Displays a side-by-side comparison of tax liabilities under Simples Nacional and Lucro Presumido, including federal, state and local taxes, and INSS payroll amounts.
- AI Tax Tool Advisor: Provides context-sensitive advice on tax optimization based on the inputs, such as on revenue mix or partner pay. LLM will use its reasoning tool.

## Style Guidelines:

- Primary color: Light blue (#ADD8E6), evoking trust and financial clarity.
- Background color: Off-white (#F9F9F9), to ensure comfortable readability.
- Accent color: Soft green (#90EE90) for positive indicators and calls to action.
- Font pairing: 'Inter' (sans-serif) for headings and 'Literata' (serif) for body text, which provides a balance of modern and readable design.
- Note: currently only Google Fonts are supported.
- Clear and structured layout with distinct input sections and a comparative results dashboard.
- Use simple and recognizable icons for each input and output parameter.