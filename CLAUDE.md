# Airline Digital Twin - Prototypes

## Objectif

Ce projet sert à créer des maquettes interactives (prototypes) pour les produits d'Airline Sciences. Chaque produit a son propre dossier dans `src/products/`.

## Design System

Toutes les interfaces doivent être construites avec les composants du **AS Design System** disponible sur `http://localhost:3000/`.

### Commandes CLI (le cli est installé en local)

LE CLI EST INSTALLE EN LOCAL, PAS BESOIN DE FAIRE NPM OU NPX !!!

```bash

# Ajouter un composant
asds add button

# Ajouter plusieurs composants
asds add button icon-button

# Lister tous les composants disponibles
asds list

# Mettre à jour les composants installés
asds update
```

### Composants disponibles

**Tokens :**

- Colors
- Icons
- Size & Radius
- Text Styles

**Basics :**

- Accordion
- Avatar
- Button
- ButtonGroup
- Calendar
- Checkbox
- Chip
- DropdownMenu
- IconButton
- Modal
- NumberInput
- Select
- Spinner
- Tab
- TextInput
- Toggle
- Tooltip

**AS Generics :**

- AircraftSelector
- AppHeader
- StudyStatusBar
- ToolIcons
- ToolTile

**Home Components :**

- HomePageActionBar
- ProductBanner
- StudyRow
- StudyStatus
- StudyTableHeader
- Workspace

**Panel Components :**

- LeftPanel
- PanelButton
- PanelGroup
- PanelHeader
- PanelSectionTitle
- PanelStudyName

**Templates :**

- HomePage
- LandingPage

### Utilisation

Consulter la documentation du design system (`http://localhost:3000/`) pour voir les exemples, les props et le code de chaque composant. Utiliser systématiquement ces composants plutôt que de créer des éléments HTML/CSS custom.

#### Import des composants

```tsx
import { Button } from '@/design-system/components/Button';
import { Icon } from '@/design-system/components/Icon';

function MyComponent() {
  return (
    <Button variant="primary" size="m" leftIcon="add">
      Add Item
    </Button>
  );
}
```

#### Utilisation des couleurs

```css
/* CSS Variables */
.element {
  color: var(--text-main);
  background-color: var(--primary-default);
}
```

```tsx
// TypeScript Constants
import { colors } from '@/design-system/tokens/colors';

const MyComponent = () => (
  <div style={{ color: colors.primary.default }}>Content</div>
);
```

#### Utilisation des Text Styles

```tsx
function MyComponent() {
  return (
    <div>
      <div className="heading-1">Main Title</div>
      <p className="body-large">This is body text</p>
      <span className="legend-bold">Legend text</span>
    </div>
  );
}
```

### Structure après installation

```
your-project/
├── src/
│   ├── design-system/
│   │   ├── components/    # React components
│   │   ├── tokens/        # Design tokens (CSS + TS)
│   │   └── icons/         # Icon components
│   └── index.css          # Updated with imports
├── asds.config.json       # CLI configuration
└── tsconfig.json          # Updated with aliases
```

## Structure du projet

```
src/
  products/
    <nom-du-produit>/
      App.jsx          # Router du produit
      components/      # Composants spécifiques au produit
      pages/           # Pages/écrans du prototype
```

## Produits

- **Airline Business Planner** : `src/products/airline-business-planner/`
