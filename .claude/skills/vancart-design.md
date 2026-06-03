---
name: vancart-design
description: Design system officiel de VanCart. À lire systématiquement avant de générer ou modifier tout composant, page ou UI dans ce projet.
---

# VanCart Design System

## Identité visuelle

VanCart est un SaaS B2B destiné aux commerçants indépendants (bars, cafés, restaurants).
Le style est épuré, professionnel et rassurant — inspiré de Notion et Linear.
Jamais flashy, jamais générique. Chaque interface doit inspirer confiance à un commerçant non-technique.

## Typographie

- Font principale : Plus Jakarta Sans (toutes les interfaces)
- Import : déjà chargée globalement via layout.tsx
- Hiérarchie :
  - Titres de page : text-2xl font-bold text-gray-900
  - Sous-titres / section headers : text-lg font-semibold text-gray-800
  - Corps de texte : text-sm text-gray-600
  - Labels et badges : text-xs font-medium
  - Jamais font-black, jamais text-4xl dans le dashboard

## Couleurs

Violet principal   #6C47FF  → bg-[#6C47FF] text-[#6C47FF] border-[#6C47FF]
Violet hover       #5835FF  → hover:bg-[#5835FF] sur boutons primaires
Violet très léger  #F0EDFF  → backgrounds de badges, highlights
Fond chaud global  #F7F6F3  → fond de page, jamais blanc pur
Blanc composants   #FFFFFF  → cards, modals, inputs
Texte principal    #111827  → text-gray-900
Texte secondaire   #4B5563  → text-gray-600
Texte désactivé    #9CA3AF  → text-gray-400
Bordures           #E5E7EB  → border-gray-200
Succès             #10B981  → text-green-500 bg-green-500
Erreur             #EF4444  → text-red-500 bg-red-500
Warning            #F59E0B  → text-amber-500 bg-amber-500

Règle absolue : ne jamais utiliser indigo-*, purple-*, blue-* de Tailwind. Toujours les valeurs hex VanCart ci-dessus.

## Espacements & Layout

- Page wrapper : max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
- Gap entre sections : space-y-6 ou gap-6
- Padding interne des cards : p-6
- Coins arrondis cards : rounded-xl
- Coins arrondis boutons : rounded-lg
- Coins arrondis badges/pills : rounded-full
- Ombre card standard : shadow-sm border border-gray-200
- Ombre card elevated : shadow-md

## Composants récurrents

Bouton primaire :
className="bg-[#6C47FF] hover:bg-[#5835FF] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"

Bouton secondaire :
className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"

Card standard :
className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"

Badge violet :
className="bg-[#F0EDFF] text-[#6C47FF] text-xs font-medium px-2.5 py-1 rounded-full"

Badge gris :
className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"

Input standard :
className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C47FF] focus:border-transparent"

Section header avec action :
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Titre</h1>
    <p className="text-sm text-gray-500 mt-1">Sous-titre descriptif</p>
  </div>
  <button className="bg-[#6C47FF] hover:bg-[#5835FF] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Action</button>
</div>

## Icônes

- Librairie : lucide-react exclusivement
- Taille standard : w-4 h-4 dans les boutons, w-5 h-5 dans les headers
- Couleur : hérite du texte parent ou text-[#6C47FF] pour les icônes d'accent

## Animations & Interactions

- Transitions : transition-colors duration-150 sur les boutons et liens
- Hover cards : hover:shadow-md transition-shadow duration-150
- Loading states : spinner SVG animate-spin en text-[#6C47FF]
- Pas de framer-motion, animations complexes, transforms lourds dans le dashboard
- Toast : utiliser le composant Toast existant dans le projet, jamais alert()

## Règles strictes

1. Fond de page : toujours bg-[#F7F6F3], jamais bg-white ou bg-gray-50 au niveau page
2. Responsive : chaque composant doit fonctionner de 320px à 1440px
3. export const dynamic = 'force-dynamic' sur toute page qui lit des cookies Supabase
4. Pas de next/image pour les logos commerçants — utiliser <img> avec object-fit
5. Langue : tous les textes UI en français (labels, placeholders, messages d'erreur)
6. Zod : messages d'erreur de validation toujours en français
7. Feature gating : utiliser le composant UpgradeGate existant pour les fonctionnalités Pro/Essentiel
8. Un seul merchant par user_id : toujours vérifier avant tout INSERT dans la table merchants

## Contexte technique

- Next.js 14 App Router
- Supabase pour auth + base de données
- Tailwind CSS (pas de CSS modules, pas de styled-components)
- TypeScript strict
- Vercel pour le déploiement (branche claude/loyalty-card-saas-mvp-1N1p6)
