# Contributing to CarbonLens 🌍

Thank you for your interest in contributing to **CarbonLens**! CarbonLens is an open-source, auditable carbon accounting and ESG engine designed to provide verifiable calculations adhering to the **GHG Protocol Corporate Standard**.

---

## 🧭 Principles of Contribution

1. **Scientific Integrity**: No arbitrary numbers or "magic constants". All emission factors must cite peer-reviewed or government official sources (e.g., MCTI, EPA, DEFRA, IPCC, IEA).
2. **Purity of `@carbonlens/core`**: The core package must remain 100% pure TypeScript with zero DOM/browser dependencies and deterministic outputs.
3. **Evidence-Based Quality**: Every bugfix or new factor must include corresponding unit tests in Vitest demonstrating mathematical accuracy.

---

## 🔬 How to Add Regional Emission Factors

We actively welcome contributions for new national or subnational electricity grids, vehicle fleet averages, and waste disposal factors.

### Step 1: Locate the Factors Database
Regional factors reside in:
`packages/core/src/constants/factors.ts`

### Step 2: Define the Factor with Mandatory Citations
When adding a factor, you must specify:
- The numeric factor in standard metric units (`kg CO2e / kWh`, `kg CO2e / km`, `kg CO2e / kg`).
- The official citation (Government Ministry, National Inventory Report submitted to UNFCCC, or official grid operator).

Example:
```typescript
// packages/core/src/constants/factors.ts
ELECTRICITY_GRIDS: {
  // ... existing grids
  CHILE_SEN: {
    kgCO2ePerKwh: 0.2850,
    label: 'Chile (SEN - Sistema Eléctrico Nacional)',
    source: 'Coordinador Eléctrico Nacional / Ministerio de Energía de Chile (2023)',
  },
}
```

### Step 3: Update the Enums and Zod Schemas
Update `ElectricityGrid` in `packages/core/src/types/index.ts` and `ElectricityGridEnum` in `packages/core/src/schemas/index.ts`.

### Step 4: Add Vitest Unit Tests
Add a test verifying the new factor in `packages/core/tests/`:
```typescript
it('calculates Chile SEN grid emissions accurately', () => {
  const result = calculateScope2({ electricityKwh: 1000, grid: 'CHILE_SEN' });
  expect(result.totalKgCO2e).toBeCloseTo(285.0, 1);
});
```

---

## 🛠️ Local Development Workflow

### Requirements
- **Node.js**: `v20+` or `v24+`
- **npm**: `v10+`

### Setup
```bash
# Clone the repository
git clone https://github.com/neverleans/calculadora-de-impacto-ambiental.git
cd calculadora-de-impacto-ambiental

# Install dependencies across all workspaces
npm install
```

### Running Tests
```bash
# Run the scientific Vitest test suite
npm run test

# Run tests in watch mode
npm --workspace=@carbonlens/core run test:watch
```

### Running the Web Platform
```bash
# Launch Vite dev server
npm run dev
# Opens at http://localhost:3000
```

### Building for Production
```bash
npm run build
```

---

## 🌿 Pull Request Process

1. Create a feature branch: `git checkout -b feature/regional-factor-chile`
2. Ensure all tests pass: `npm run test`
3. Ensure the project builds without errors: `npm run build`
4. Commit with descriptive messages (e.g. `feat(factors): add Chile SEN grid emission factor`)
5. Open a Pull Request referencing the data source documentation.
