# 🌍 CarbonLens — Auditable GHG Carbon Footprint Engine & ESG Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-5.6%20Strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests: 30 Passing](https://img.shields.io/badge/Vitest-30%20passed-brightgreen.svg)](https://vitest.dev/)
[![GHG Protocol: Scopes 1, 2, 3](https://img.shields.io/badge/Standard-GHG%20Protocol%20Compliant-10b981.svg)](https://ghgprotocol.org/)
[![Node: >=20.0.0](https://img.shields.io/badge/Node-%3E%3D20.0.0-68a063.svg)](https://nodejs.org/)

> **CarbonLens** é uma biblioteca e plataforma web open-source de padrão industrial para cálculo, auditoria e simulação de pegada de carbono (Escopos 1, 2 e 3) segundo as diretrizes científicas do **GHG Protocol Corporate Standard**, **MCTI/SIN**, **DEFRA**, **US EPA** e **IPCC AR6**.
>
> Disponível como motor desacoplado em TypeScript puro (`@carbonlens/core`) e interface web moderna com dashboard analítico, simulação de cenários *What-If*, valoração de créditos de carbono (VCM) e exportação de **Relatório Executivo ESG em PDF / CSV**.

🌐 **Acesse a plataforma online**: [https://neverleans.github.io/calculadora-de-impacto-ambiental/](https://neverleans.github.io/calculadora-de-impacto-ambiental/) *(ou execute localmente via Vite)*

---

## 📑 Sumário / Table of Contents
1. [Arquitetura & Filosofia de Engenharia](#-arquitetura--filosofia-de-engenharia)
2. [Fundamentação Científica & Fórmulas Matemáticas](#-fundamentação-científica--fórmulas-matemáticas)
3. [Base Oficial de Fatores de Emissão](#-base-oficial-de-fatores-de-emissão)
4. [Instalação & Guia Rápido da Lib (`@carbonlens/core`)](#-instalação--guia-rápido-da-lib-carbonlenscore)
5. [Execução da Plataforma Web & Recursos](#-execução-da-plataforma-web--recursos)
6. [Simulação de Cenários What-If & Compensação](#-simulação-de-cenários-what-if--compensação)
7. [Bateria de Testes Vitest](#-bateria-de-testes-vitest)
8. [Contribuindo & Novos Fatores Regionais](#-contribuindo--novos-fatores-regionais)

---

## 🏛 Arquitetura & Filosofia de Engenharia

O projeto é estruturado como um monorepo modular em conformidade com as melhores práticas de engenharia de software e padrões de contabilidade climática corporativa:

```
calculadora-de-impacto-ambiental/
├── packages/
│   ├── core/                  # @carbonlens/core: Motor de cálculo desacoplado (Zero DOM, 100% TS puro)
│   │   ├── src/
│   │   │   ├── constants/     # Base oficial de fatores de emissão (MCTI, DEFRA, EPA, IPCC)
│   │   │   ├── schemas/       # Validação estrita em runtime com Zod
│   │   │   ├── scopes/        # Motores individuais para Escopo 1, Escopo 2 e Escopo 3
│   │   │   ├── simulation/    # Algoritmos What-If, restauração da Mata Atlântica e créditos VCM
│   │   │   ├── audit/         # Trilha de auditoria, metas SBTi 1.5°C e exportador CSV
│   │   │   └── types/         # Contratos e tipos de domínio TypeScript
│   │   └── tests/             # Suíte Vitest com validação matemática e de casos de borda
│   └── web/                   # Plataforma Web React + Vite + Tailwind CSS + Recharts + jsPDF
│       ├── src/
│       │   ├── components/    # Formulários de escopos, dashboard, gráficos e simulador
│       │   ├── utils/         # Gerador de Relatório Executivo PDF e persistência offline
│       │   └── types/         # Tipos da camada de persistência local
├── .github/workflows/ci.yml   # Integração Contínua (CI) automatizada
├── CONTRIBUTING.md            # Guia de contribuição para novos fatores regionais
└── README.md
```

### Princípios Chave:
- **Separação de Preocupações**: O pacote `@carbonlens/core` não toca no DOM, não possui dependências de UI e pode ser utilizado em backends Node.js, Cloudflare Workers, microserviços ou no frontend.
- **Trilha de Auditoria Transparente (`auditTrail`)**: Toda emissão calculada retorna não apenas o número final, mas o fator aplicado, sua unidade, fonte oficial e fórmula expandida.
- **Diferenciação de Carbono Biogênico**: Em conformidade estrita com o GHG Protocol, o CO₂ biogênico proveniente da combustão de biocombustíveis (ex: etanol de cana-de-açúcar) é reportado em item separado e não somado ao total de emissões fósseis.

---

## 📐 Fundamentação Científica & Fórmulas Matemáticas

O motor de cálculo do CarbonLens substitui estimativas arbitrárias por equações estequiométricas e empíricas consolidadas pelas principais autoridades ambientais internacionais:

### 1. Escopo 1: Combustão Móvel e Estacionária Direta

Para combustão em veículos com base na distância percorrida:
$$E_{\text{Escopo 1, km}} = \sum_{i=1}^{n} \Big( D_i \times EF_{\text{veículo}, i}^{\text{fóssil}} \Big)$$

Para combustão avaliada pelo volume de combustível ou massa de gás:
$$E_{\text{Escopo 1, vol}} = \sum_{j=1}^{m} \Big( V_j \times EF_{\text{combustível}, j}^{\text{fóssil}} \Big) + \Big( M_{\text{GLP}} \times EF_{\text{GLP}} \Big)$$

Emissões biogênicas (reportadas separadamente conforme norma GHG Protocol Corporate Standard):
$$E_{\text{biogênico}} = \sum \Big( D_i \times EF_{\text{veículo}, i}^{\text{biogênico}} \Big) + \sum \Big( V_j \times EF_{\text{combustível}, j}^{\text{biogênico}} \Big)$$

### 2. Escopo 2: Eletricidade da Rede (Métodos Baseados na Localização e Mercado)

Considerando a fração de energia renovável com emissão zero $R_{\text{renovável}} \in [0, 1]$ (geração solar fotovoltaica própria ou certificados I-REC):
$$E_{\text{Escopo 2}} = Q_{\text{kWh}} \times (1 - R_{\text{renovável}}) \times EF_{\text{rede}}$$

Onde $EF_{\text{rede}}$ para o Brasil adota o fator oficial médio anual publicado pelo SIRENE/MCTI:
$$EF_{\text{SIN, Brasil}} \approx 0.0617 \, \text{kg CO}_2\text{e/kWh}$$

### 3. Escopo 3: Resíduos, Água, Transporte Coletivo e Aviação Comercial

A pegada da cadeia de valor agrega o ciclo dos resíduos, perdas e tratamento de água, deslocamento e transporte aéreo:
$$E_{\text{Escopo 3}} = E_{\text{água}} + E_{\text{resíduos}} + E_{\text{voos}} + E_{\text{transporte}}$$

Para viagens aéreas, inclui-se o **Índice de Forçamento Radiativo (RFI)** para capturar o impacto térmico dos cirros e emissões em alta altitude:
$$E_{\text{voos}} = \sum_{k} \Big( D_k \times P_k \times EF_{\text{voo}, k} \times \text{RFI} \Big), \quad \text{onde } \text{RFI} = 1.9$$

Para resíduos sólidos orgânicos destinados a aterro sem captura de metano (decomposição anaeróbica de alto potencial de aquecimento global $GWP_{\text{CH}_4}$):
$$E_{\text{resíduo}} = M_{\text{orgânico}} \times EF_{\text{aterro}} = M_{\text{orgânico}} \times 0.850 \, \text{kg CO}_2\text{e/kg}$$

### 4. Simulação de Cenários What-If & Redução Anual

Ao substituir $D_{\text{dia}}$ km de carro por modal coletivo $d$ dias por semana ao longo de $W$ semanas úteis:
$$\Delta E_{\text{evitado}} = D_{\text{dia}} \times d \times W \times \Big( EF_{\text{carro}} - EF_{\text{coletivo}} \Big)$$

### 5. Compensação Ecológica (Mata Atlântica)

Com base no acúmulo de biomassa e sequestro de carbono de mudas nativas da Mata Atlântica em restauração florestal:
$$N_{\text{árvores, ciclo vida}} = \left\lceil \frac{E_{\text{total}}}{S_{\text{árvore, ciclo}}} \right\rceil = \left\lceil \frac{E_{\text{total}}}{150 \, \text{kg CO}_2} \right\rceil$$

$$N_{\text{árvores, taxa anual}} = \left\lceil \frac{E_{\text{total}}}{S_{\text{árvore, ano}}} \right\rceil = \left\lceil \frac{E_{\text{total}}}{15.6 \, \text{kg CO}_2/\text{ano}} \right\rceil$$

---

## 📊 Base Oficial de Fatores de Emissão

Todos os fatores incorporados no CarbonLens possuem rastreabilidade oficial documentada no código:

| Escopo | Categoria / Atividade | Fator | Unidade | Fonte Oficial Citada |
| :--- | :--- | :--- | :--- | :--- |
| **Escopo 1** | Gasolina Comum C (E27) | `0.1624` | kg CO₂e / km | INMETRO PBE Veicular & GHG Protocol Brasil |
| **Escopo 1** | Etanol Hidratado (E100) Fóssil | `0.0050` | kg CO₂e / km | RenovaBio / Balanço Energético Nacional (BEN) |
| **Escopo 1** | Etanol Hidratado Biogênico | `0.1780` | kg CO₂ / km | GHG Protocol Corporate (Memo Item) |
| **Escopo 1** | Diesel Comercial S10 (B14) | `0.2450` | kg CO₂e / km | MME / ANP & BEN |
| **Escopo 1** | GNV (Gás Natural Veicular) | `0.1780` | kg CO₂e / km | Comgás & ANP |
| **Escopo 1** | Gás GLP de Cozinha (Botijão) | `2.9840` | kg CO₂e / kg | IPCC Guidelines & MME |
| **Escopo 2** | Eletricidade Brasil (SIN) | `0.0617` | kg CO₂e / kWh | MCTI — Fator Médio SIRENE Brasil |
| **Escopo 2** | Eletricidade EUA (eGRID) | `0.3712` | kg CO₂e / kWh | US EPA eGRID National Average |
| **Escopo 2** | Eletricidade Reino Unido | `0.2070` | kg CO₂e / kWh | UK DEFRA / DESNZ National Grid |
| **Escopo 2** | Eletricidade União Europeia | `0.2310` | kg CO₂e / kWh | European Environment Agency (EEA) |
| **Escopo 2** | Geração Própria / I-REC | `0.0000` | kg CO₂e / kWh | GHG Protocol Scope 2 Market-Based |
| **Escopo 3** | Resíduos Orgânicos em Aterro | `0.8500` | kg CO₂e / kg | IPCC Waste Model / EPA WARM |
| **Escopo 3** | Compostagem de Orgânicos | `0.0700` | kg CO₂e / kg | IPCC Guidelines for Waste Composting |
| **Escopo 3** | Reciclagem de Secos | `0.0400` | kg CO₂e / kg | DEFRA Waste Factors & CEMPRE Brasil |
| **Escopo 3** | Água Tratada e Esgoto | `0.000344` | kg CO₂e / L | SABESP Relatório de Sustentabilidade & Water UK |
| **Escopo 3** | Voo Curto (<500 km) com RFI | `0.4085` | kg CO₂e / pkm | ICAO Carbon Calculator & DEFRA |
| **Escopo 3** | Metrô / Trem Urbano | `0.0240` | kg CO₂e / pkm | Metrô de São Paulo & DEFRA Light Rail |

---

## 📦 Instalação & Guia Rápido da Lib (`@carbonlens/core`)

Você pode usar o motor de cálculo puramente em qualquer projeto TypeScript ou JavaScript:

```bash
npm install @carbonlens/core zod
```

### Exemplo de Uso em TypeScript:

```typescript
import {
  calculateCarbonAssessment,
  simulateCommuteReplacement,
  calculateForestryOffset,
  estimateVoluntaryCarbonCredits,
  generateEsgExecutiveSummary,
} from '@carbonlens/core';

// 1. Executar inventário completo Scopes 1, 2, 3
const assessment = calculateCarbonAssessment({
  organizationOrIndividualName: 'Minha Empresa Tech',
  period: '2024-Q1',
  scope1: {
    vehicles: [
      { fuelType: 'GASOLINE_C', distanceKm: 850 },
    ],
    stationary: { lpgKg: 13 },
  },
  scope2: {
    electricityKwh: 450,
    grid: 'BRAZIL_SIN',
    renewablePercentage: 50, // 50% solar próprio
  },
  scope3: {
    waterLiters: 12000,
    wasteOrganicKg: 30,
    wasteOrganicDisposal: 'COMPOSTING',
  },
});

console.log(`Pegada Total: ${assessment.totalTonsCO2e} tCO2e (${assessment.totalKgCO2e} kg)`);
console.log(`Escopo 1: ${assessment.shares.scope1Percent}% | Escopo 2: ${assessment.shares.scope2Percent}%`);
console.log(`Ponto Crítico (Hotspot): ${assessment.hotspot.description}`);

// 2. Simular cenário What-If de transporte
const commuteSimulation = simulateCommuteReplacement({
  carFuelType: 'GASOLINE_C',
  roundTripKmPerDay: 30,
  daysReplacedPerWeek: 3,
  replacementMode: 'METRO_SUBWAY_TRAIN',
});
console.log(commuteSimulation.explanation);
// -> Evita ~597.9 kg CO2e/ano migrando para o metrô!

// 3. Compensação por Restauração Florestal (Mata Atlântica)
const offset = calculateForestryOffset(assessment.totalKgCO2e);
console.log(`Árvores nativas necessárias: ${offset.treesNeededLifetime} mudas`);

// 4. Estimativa de Créditos de Carbono no Mercado Voluntário (VCM)
const credits = estimateVoluntaryCarbonCredits(assessment.totalKgCO2e);
console.log(`Custo estimado (VCS Verra): R$ ${credits.estimatedTotalBRL.average}`);
```

---

## 💻 Execução da Plataforma Web & Recursos

A plataforma web construída em React, Tailwind CSS e Vite oferece uma experiência de nível sênior:

```bash
# Na raiz do monorepo:
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build
```

### Funcionalidades da Interface:
- 📱 **Painel de Atividades**: Formulários dedicados com validação Zod e presets rápidos (ex: apartamento, residência, escritório PME).
- 📈 **Dashboard Interativo com Recharts**: Gráficos de rosca da partição dos escopos e barras dos principais hotspots.
- 🎯 **Alinhamento com Metas SBTi (1,5°C)**: Cálculo automático da redução anual de 4,2% e teto para 2030 (-42%).
- 📄 **Exportação de Relatório Executivo ESG em PDF**: Documento formal corporativo gerado no navegador via `jspdf` e `jspdf-autotable`, pronto para comitês de governança e auditoria.
- 💾 **Offline-First & Histórico Mensal**: Persistência no `localStorage` com gráficos de linha de tendência ao longo dos meses.
- 📁 **Exportação de Dados Brutos**: Download imediato em CSV e JSON com todas as fórmulas, atividades e fontes oficiais.

---

## 🧪 Bateria de Testes Vitest

O motor científico `@carbonlens/core` possui cobertura abrangente com **30 testes unitários** automatizados:

```bash
# Executar todos os testes
npm run test

# Executar com relatório de cobertura
npm --workspace=@carbonlens/core run test:coverage
```

### O que é validado nos testes:
- Precisão matemática das equações dos Escopos 1, 2 e 3 frente aos dados do SIRENE/MCTI, DEFRA e IPCC.
- Segregação mandatória de CO₂ biogênico para biocombustíveis.
- Tratamento de matrizes 100% renováveis e autoconsumo solar proporcional.
- Rejeição de valores negativos e anomalias de entrada por esquemas Zod.
- Consistência dos algoritmos de substituição modal e créditos de carbono.

---

## 🤝 Contribuindo & Novos Fatores Regionais

Contribuições para expansão de matrizes energéticas regionais (América Latina, Europa, Ásia) e novos modais de transporte são muito bem-vindas!

Consulte nosso [CONTRIBUTING.md](CONTRIBUTING.md) para o passo a passo sobre como submeter novos fatores de emissão com citação oficial e testes associados.

---

## ⚖️ Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com rigor científico e dedicação à transição ecológica global 🌱<br>
  <strong>CarbonLens — Open Carbon Accounting & ESG Engine</strong>
</p>
