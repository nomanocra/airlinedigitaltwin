# Airline Digital Twin - Prototypes

## Objectif

Ce projet sert à créer des maquettes interactives (prototypes) pour les produits d'Airline Sciences. Chaque produit a son propre dossier dans `src/products/`.

## Design System

Toutes les interfaces doivent être construites avec les composants du **AS Design System** disponible sur `http://localhost:3001/`.

### Composants disponibles

**Tokens :**
- Colors
- Icons
- Text Styles

**Basics :**
- Avatar
- Button
- ButtonGroup
- Checkbox
- IconButton
- NumberInput
- Select
- Spinner
- Tab
- TextInput
- Toggle
- ToolIcons
- Tooltip

**Composites :**
- Accordion
- AppHeader
- Modal
- Workspace

### Utilisation

Consulter la documentation du design system (`http://localhost:3001/`) pour voir les exemples, les props et le code de chaque composant. Utiliser systématiquement ces composants plutôt que de créer des éléments HTML/CSS custom.

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
