# Assumptions - Plan de développement

## 1. Introduction

Ce document décrit les écrans "Assumptions" (inputs d'une study) nécessaires pour compute la study.

### Règles de développement
- Développer page par page
- Accéder au lien Figma uniquement lors du développement de la page concernée
- Utiliser AG Grid avec le CSS custom du design system (asds)
- Utiliser les composants asds
- Titres des headers de tableaux en **Capital Case**

### Règles pour les tableaux AG Grid
- Colonnes réparties uniformément (`flex: 1`)
- Taille minimum par colonne pour une bonne lisibilité (`minWidth`)
- Scroll horizontal si le tableau devient plus petit que la somme des `minWidth`

---

## 2. Fleet

### 2.1 Tab Fleet (existant à compléter)

**Status:** Tableau existant, ajout du switch vue Tableau/Gantt Chart

**Fonctionnalité à ajouter:**
- ButtonGroup pour switcher entre vue "Tableau" et vue "Gantt Chart"
- Le Gantt Chart affiche les périodes de mise en service des avions (Enter in Service → Retirement)

**Question:** Vérifier si AG Grid propose un Gantt Chart gratuit. Sinon, proposer une alternative.

**Figma:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=396-18214&m=dev

---

### 2.2 Tab Cost Operations

**Structure:** Tableau avec les AC Types

**Colonnes (lecture seule):**
| Colonne | Type |
|---------|------|
| A/C Type | text |
| Engine | text |
| Layout | text |
| Nb of AC | text |
| Ownership | text |
| Enter in Service | text |
| Retirement | text |

**Colonnes (inputs):**
| Colonne | Type |
|---------|------|
| Ground handling charge (USD/sector) | NumberInput |
| Fuel Ageing Factor (%) | NumberInput |

**Validation:** Au moins une valeur doit être entrée pour valider l'input

**Figma:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=764-25162&m=dev

---

### 2.3 Tab Cost Ownership

**Structure:** Tableau avec les AC Types

**Colonnes (lecture seule):**
| Colonne | Type |
|---------|------|
| A/C Type | text |
| Engine | text |
| Layout | text |
| Nb of AC | text |
| Ownership | text |
| Enter in Service | text |
| Retirement | text |

**Colonnes (inputs):**
| Colonne | Type | Notes |
|---------|------|-------|
| Monthly Lease Rate ($) | NumberInput | |
| AC Value Upon Acquisition ($) | NumberInput | |
| Spares provisioning per A/C family ($) | NumberInput | |
| Monthly Insurance ($) | NumberInput | **Read-only**, calculé = `AC Value Upon Acquisition * 0.01 / 12` |

**Validation:** Au moins une valeur doit être entrée pour valider l'input

**Figma:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=349-9963&m=dev

---

### 2.4 Tab Crew Configuration

**Structure:** Tableau avec les AC Types

**Colonnes (lecture seule):**
| Colonne | Type |
|---------|------|
| A/C Type | text |
| Engine | text |
| Layout | text |
| Nb of AC | text |
| Ownership | text |
| Enter in Service | text |
| Retirement | text |

**Colonnes (inputs):**
| Colonne | Type |
|---------|------|
| Captain per Crew | NumberInput |
| First Officer per Crew | NumberInput |
| Cabin Manager per Crew | NumberInput |
| Cabin Attendant per Crew | NumberInput |

**Validation:** Au moins une valeur doit être entrée pour valider l'input

**Figma:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=349-10394&m=dev

---

## 3. Network

La page Network permet d'entrer les données du réseau à simuler.

### 3.1 Tab Routes

**Structure:**
- Empty state par défaut (même layout que Fleet)
- Bouton "+" pour ajouter une route → ouvre une modal

**Modal "Add Route":**
| Champ | Type | Notes |
|-------|------|-------|
| Origin | TextInput/Select | Requis |
| Destination | TextInput/Select | Requis |
| Start Date | Calendar (month) | Pré-filtré par dates simulation, défaut = début simulation |
| End Date | Calendar (month) | Pré-filtré par dates simulation, défaut = fin simulation |

**Comportement modal:**
- Bouton "Add Route" grisé tant que Origin et Destination ne sont pas remplis
- Les dates disponibles sont filtrées par la période de simulation

**Tableau des routes:**
| Colonne | Type |
|---------|------|
| Origin | text |
| Destination | text |
| Start Date | Calendar (month) |
| End Date | Calendar (month) |

**Validation:** Au moins une route doit être entrée pour valider l'input

**Figma page:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=181-8339&m=dev

**Figma modal:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=174-2908&m=dev

---

### 3.2 Tab Pricing

**Structure:**
- Input général en haut de page
- Tableau Pricing par route

**Input général:**
| Champ | Type |
|-------|------|
| Discount for Normal Fares (%) | NumberInput |

**Tableau (une ligne par route):**
| Colonne | Type | Notes |
|---------|------|-------|
| Route (Origin - Destination) | text | |
| Market yield for 2024 ($/pax km) | NumberInput | |
| Discount Strategy | Select | |
| Yield | NumberInput | |
| Fare | text | **Calculé** = `Yield × Distance` |

**Validation:** Toutes les valeurs doivent être entrées pour valider les inputs

**Figma:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=544-16996&m=dev

---

### 3.3 Tab Fleet Plan

**Structure:** Tableau avec la liste des routes

**Tableau (une ligne par route):**
| Colonne | Type | Notes |
|---------|------|-------|
| Route (Origin - Destination) | text | |
| Aircraft Allocated | Select | Liste des AC disponibles |

**Figma:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=538-15743&m=dev

---

### 3.4 Tab Frequencies

**Structure:** Tableau avec les routes et les fréquences mensuelles

**Tableau (une ligne par route):**
| Colonne | Type |
|---------|------|
| Route (Origin - Destination) | text |
| Jan 2026 | NumberInput |
| Feb 2026 | NumberInput |
| Mar 2026 | NumberInput |
| ... | NumberInput |
| (jusqu'à la fin de la simulation) | |

**Note:** Les colonnes de mois sont générées dynamiquement selon la période de simulation définie

**Figma:** https://www.figma.com/design/b2fMmzGCoFkMOwsURIVlw9/Airline-Business-Planner?node-id=181-10141&m=dev

---

## 4. Ordre de développement suggéré

1. **Fleet - Tab Fleet** (ajout Gantt Chart)
2. **Fleet - Tab Cost Operations**
3. **Fleet - Tab Cost Ownership**
4. **Fleet - Tab Crew Configuration**
5. **Network - Tab Routes** (avec modal)
6. **Network - Tab Pricing**
7. **Network - Tab Fleet Plan**
8. **Network - Tab Frequencies**
