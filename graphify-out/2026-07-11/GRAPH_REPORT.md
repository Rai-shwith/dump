# Graph Report - .  (2026-07-11)

## Corpus Check
- 481 files · ~228,760 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 966 nodes · 1175 edges · 247 communities (60 shown, 187 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Apps Dump
- Workers Dump
- Apps Dump
- Apps Dump
- Apps Dump
- Workers Dump
- Apps Dump
- Apps Dump
- Apps Dump
- Components Apps
- Apps Dump
- Apps Dump
- Menubar Apps
- Workers Dump
- React Apps
- Apps Dump
- Apps Dump
- Apps Dump
- Table Apps
- Breadcrumb Apps
- Drawer Apps
- Apps Dump
- Apps Dump
- Card Apps
- Toggle Apps
- Task Docs
- Alert Apps
- Workers Dump
- Browser Rendering
- Sandbox Agents
- Smart Placement
- Workers For
- Avatar Apps
- Badge Apps
- Apps Dump
- Task 013
- Task Docs
- Task Docs
- Agents Sdk
- Cloudflare Agents
- Bindings Agents
- Bot Management
- Agents Skills
- Hyperdrive Agents
- Agents Skills
- Secrets Store
- Assets Cloudflare
- Tail Workers
- Workers Vpc
- Apps Dump
- Project Quality
- Task 012
- Workers Dump
- Agents Skills
- Analytics Engine
- Cloudflare Api
- Api Shield
- Argo Smart
- Artifacts Agents
- Cloudflare Agents
- Cache Reserve
- Agents Skills
- Email Agents
- Flagship Agents
- Cloudflare Images
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Snippets Cloudflare
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Cloudflare Waf
- Web Cloudflare
- Cloudflare Agents
- Agents Dump
- Clsx Apps
- Date Fns
- Embla Carousel
- Fontsource Geist
- Fontsource Geist
- Framer Motion
- Hookform Resolvers
- Input Otp
- Lucide React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- Radix React
- React Dom
- React Helmet
- React Hook
- React Resizable
- React Router
- Recharts Apps
- Sonner Apps
- Tailwind Merge
- Tailwindcss Apps
- Tanstack React
- Vaul Apps
- Zod Apps
- Docs One
- Docs Tasks
- Task 014
- Task 018
- Task 020
- Docs Task
- Task 023
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Tests Task
- Agents Rules
- Graphify Agents
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Email Agents
- Agents Skills
- Agents Skills
- Agents Skills
- Graphql Api
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Realtimekit Agents
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Placement Agents
- Placement Agents
- Placement Agents
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Cloudflare Spectrum
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Cloudflare Stream
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Workers Agents
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Agents Skills
- Workers Playground
- Apps Dump
- Docs Decisions
- Docs Tasks
- Docs Tasks
- Task Docs
- Task Docs
- Task 018
- Task Docs
- Task Docs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 66 edges
2. `compilerOptions` - 17 edges
3. `createError()` - 12 edges
4. `handleCreate()` - 12 edges
5. `handleUpdate()` - 11 edges
6. `isExpired()` - 11 edges
7. `handleDelete()` - 10 edges
8. `handleStar()` - 10 edges
9. `compilerOptions` - 10 edges
10. `getOwnerToken()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Dump` --semantically_similar_to--> `Dump Architecture`  [INFERRED] [semantically similar]
  README.md → .agents/AGENTS.md
- `Fat Handlers & Logic Leakage` --conceptually_related_to--> `Size Limits`  [INFERRED]
  PROJECT-QUALITY-REPORT/00-EXECUTIVE-SUMMARY.md → docs/DECISIONS.md
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  apps/dump-web/src/components/ui/alert-dialog.tsx → apps/dump-web/src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  apps/dump-web/src/components/ui/alert-dialog.tsx → apps/dump-web/src/lib/utils.ts
- `BreadcrumbSeparator()` --calls--> `cn()`  [EXTRACTED]
  apps/dump-web/src/components/ui/breadcrumb.tsx → apps/dump-web/src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Bot Management Features** — _agents_skills_cloudflare_references_bot_management_readme_bot_management, _agents_skills_cloudflare_references_bot_management_api_botmanagement, _agents_skills_cloudflare_references_bot_management_configuration_js_detections, _agents_skills_cloudflare_references_bot_management_configuration_cf_bm_cookie [INFERRED 0.85]
- **Stream Live Features** — _agents_skills_cloudflare_references_stream_api_live_simulcast, _agents_skills_cloudflare_references_stream_api_live_webrtc_streaming [INFERRED 0.85]
- **WAF Components** — _agents_skills_cloudflare_references_waf_readme_managed_rulesets, _agents_skills_cloudflare_references_waf_readme_custom_rules, _agents_skills_cloudflare_references_waf_readme_rate_limiting [EXTRACTED 1.00]
- **One-Time View Flow** — docs_api_one_time_view, docs_decisions_one_time_view, docs_tasks_task_009__one_time_view_logic_handleraw [INFERRED 0.85]

## Communities (247 total, 187 thin omitted)

### Community 0 - "Apps Dump"
Cohesion: 0.06
Nodes (57): ActionProps, ContentView(), Props, CreateForm(), Props, DeleteConfirm(), Props, EditPanel() (+49 more)

### Community 1 - "Workers Dump"
Cohesion: 0.10
Nodes (54): authorizeRead(), checkAuthorization(), createError(), CreateRequestBody, handleCreate(), handleDelete(), handleOneTimeView(), handleRaw() (+46 more)

### Community 2 - "Apps Dump"
Cohesion: 0.04
Nodes (46): devDependencies, autoprefixer, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+38 more)

### Community 3 - "Apps Dump"
Cohesion: 0.05
Nodes (37): react, Button, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem (+29 more)

### Community 4 - "Apps Dump"
Cohesion: 0.05
Nodes (38): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+30 more)

### Community 5 - "Workers Dump"
Cohesion: 0.06
Nodes (32): @cloudflare/workers-types, hono, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, author, dependencies, hono, devDependencies (+24 more)

### Community 6 - "Apps Dump"
Cohesion: 0.07
Nodes (28): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+20 more)

### Community 7 - "Apps Dump"
Cohesion: 0.12
Nodes (15): App(), Logo(), Navbar(), AccordionContent, AccordionItem, AccordionTrigger, Toaster(), ToasterProps (+7 more)

### Community 8 - "Apps Dump"
Cohesion: 0.09
Nodes (13): Checkbox, HoverCardContent, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, PopoverContent, Progress (+5 more)

### Community 9 - "Components Apps"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 10 - "Apps Dump"
Cohesion: 0.19
Nodes (14): ButtonProps, buttonVariants, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps (+6 more)

### Community 11 - "Apps Dump"
Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 12 - "Menubar Apps"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 13 - "Workers Dump"
Cohesion: 0.13
Nodes (14): @cloudflare/workers-types, compilerOptions, lib, module, moduleResolution, noImplicitReturns, noUnusedLocals, noUnusedParameters (+6 more)

### Community 14 - "React Apps"
Cohesion: 0.15
Nodes (13): dependencies, class-variance-authority, cmdk, @radix-ui/react-dropdown-menu, @radix-ui/react-scroll-area, @radix-ui/react-toggle, react-day-picker, class-variance-authority (+5 more)

### Community 15 - "Apps Dump"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 16 - "Apps Dump"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 17 - "Apps Dump"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 18 - "Table Apps"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 19 - "Breadcrumb Apps"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 20 - "Drawer Apps"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 21 - "Apps Dump"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 22 - "Apps Dump"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 23 - "Card Apps"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 24 - "Toggle Apps"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 25 - "Task Docs"
Cohesion: 0.33
Nodes (6): ViewPage, TASK-016, TASK-017, ViewPage, TASK-018, ViewPage

### Community 26 - "Alert Apps"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 27 - "Workers Dump"
Cohesion: 0.60
Nodes (4): addCorsHeaders(), addSecurityHeaders(), ALLOWED_ORIGINS, applyMiddleware()

### Community 28 - "Browser Rendering"
Cohesion: 0.50
Nodes (4): Playwright Binding, Puppeteer Binding, Session Limits, Browser Rendering

### Community 29 - "Sandbox Agents"
Cohesion: 0.50
Nodes (4): Code Interpreter, getSandbox, proxyToSandbox, Cloudflare Sandbox SDK

### Community 30 - "Smart Placement"
Cohesion: 0.50
Nodes (4): Frontend + Backend Split, Fetch Handler Limitation, run_worker_first Performance Degradation, Smart Placement

### Community 31 - "Workers For"
Cohesion: 0.50
Nodes (4): Dynamic Dispatch Worker, Outbound Worker, User Worker, Workers for Platforms

### Community 32 - "Avatar Apps"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 33 - "Badge Apps"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 34 - "Apps Dump"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 35 - "Task 013"
Cohesion: 0.50
Nodes (4): RESERVED_KEYWORDS, TASK-003, TASK-013: Reserved Codes, validate.js

### Community 36 - "Task Docs"
Cohesion: 0.50
Nodes (4): CreatePage, CreatePage, TASK-015, TASK-016

### Community 37 - "Task Docs"
Cohesion: 0.50
Nodes (4): HomePage, TASK-015: Frontend Scaffold, HomePage, TASK-019

### Community 38 - "Agents Sdk"
Cohesion: 0.67
Nodes (3): Agent Base Class, AIChatAgent, Cloudflare Agents SDK

### Community 39 - "Cloudflare Agents"
Cohesion: 0.67
Nodes (3): Cloudflare AI Gateway, Cloudflare AI Search, Cloudflare Platform Skill

### Community 40 - "Bindings Agents"
Cohesion: 0.67
Nodes (3): Env Interface, Global Scope Mutation, Cloudflare Bindings

### Community 41 - "Bot Management"
Cohesion: 0.67
Nodes (3): BotManagement Interface, JavaScript Detections, Bot Management

### Community 42 - "Agents Skills"
Cohesion: 0.67
Nodes (3): SQL API, DO Storage, Durable Objects

### Community 43 - "Hyperdrive Agents"
Cohesion: 0.67
Nodes (3): Smart Placement Integration, Connection Pooling, Cloudflare Hyperdrive

### Community 44 - "Agents Skills"
Cohesion: 0.67
Nodes (3): Queue Push Consumer, Entire Batch Retried After Single Error, Messages Retry Forever (Un-acked)

### Community 46 - "Assets Cloudflare"
Cohesion: 0.67
Nodes (3): ASSETS Binding, Fetcher, Cloudflare Static Assets

### Community 47 - "Tail Workers"
Cohesion: 0.67
Nodes (3): TraceItem, tail_consumers, Tail Workers

### Community 48 - "Workers Vpc"
Cohesion: 0.67
Nodes (3): Tunnel Integration, TCP Sockets API, Workers VPC Connectivity

### Community 50 - "Project Quality"
Cohesion: 0.67
Nodes (3): Size Limits, Fat Handlers & Logic Leakage, UI Monolith

### Community 51 - "Task 012"
Cohesion: 0.67
Nodes (3): handleRaw, TASK-009, TASK-012: Raw Endpoint

## Knowledge Gaps
- **542 isolated node(s):** `TASK-005.sh script`, `TASK-006.sh script`, `TASK-007.sh script`, `TASK-008.sh script`, `TASK-009.sh script` (+537 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **187 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `React Apps` to `Apps Dump`, `Apps Dump`, `Clsx Apps`, `Date Fns`, `Embla Carousel`, `Fontsource Geist`, `Fontsource Geist`, `Framer Motion`, `Hookform Resolvers`, `Input Otp`, `Lucide React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `Radix React`, `React Dom`, `React Helmet`, `React Hook`, `React Resizable`, `React Router`, `Recharts Apps`, `Sonner Apps`, `Tailwind Merge`, `Tailwindcss Apps`, `Tanstack React`, `Vaul Apps`, `Zod Apps`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `cn()` connect `Apps Dump` to `Apps Dump`, `Apps Dump`, `Apps Dump`, `Apps Dump`, `Apps Dump`, `Menubar Apps`, `Apps Dump`, `Apps Dump`, `Apps Dump`, `Table Apps`, `Breadcrumb Apps`, `Drawer Apps`, `Apps Dump`, `Apps Dump`, `Card Apps`, `Toggle Apps`, `Alert Apps`, `Avatar Apps`, `Badge Apps`, `Apps Dump`, `Apps Dump`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `react` connect `Apps Dump` to `Apps Dump`, `React Apps`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `TASK-005.sh script`, `TASK-006.sh script`, `TASK-007.sh script` to the rest of the system?**
  _549 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Apps Dump` be split into smaller, more focused modules?**
  _Cohesion score 0.05880665519219736 - nodes in this community are weakly interconnected._
- **Should `Workers Dump` be split into smaller, more focused modules?**
  _Cohesion score 0.09807692307692308 - nodes in this community are weakly interconnected._
- **Should `Apps Dump` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._