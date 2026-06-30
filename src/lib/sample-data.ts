import type { WorkroomData } from "./types";

export const sampleData: WorkroomData = {
  ideas: [
    {
      id: "idea-dollset-1",
      title: "DOLLSET flash hotgirl launch grid",
      rawIdea:
        "A dress brand that feels like flash photography, hotgirl confidence, and sharp party styling without drifting into princess/coquette softness.",
      category: "Brand",
      linkedProjectId: "project-dollset",
      tasteFit: 9,
      portfolioPotential: 9,
      brandDepth: 8,
      monetizationPotential: 8,
      careerUsefulness: 7,
      currentStatus: "Visual Experiment",
      nextAction: "Build 6-frame lookbook sequence with flash, chrome, black-red styling rules.",
      reasonWhyThisMatters:
        "This can become a high-impact fashion branding case that shows taste control and audience clarity.",
      tags: "fashion, flash, hotgirl, dress, launch",
      deadline: "2026-07-06",
    },
    {
      id: "idea-nacre-1",
      title: "NACRE ROOM private bridal mood system",
      rawIdea:
        "A total bridal brand that feels private, pearly, and quiet instead of generic wedding hall fantasy.",
      category: "Brand",
      linkedProjectId: "project-nacre",
      tasteFit: 8,
      portfolioPotential: 8,
      brandDepth: 9,
      monetizationPotential: 7,
      careerUsefulness: 8,
      currentStatus: "Concept Candidate",
      nextAction: "Decode pearl, veil, and private room references into material and composition rules.",
      reasonWhyThisMatters:
        "It can show how to avoid bridal cliches while still keeping a complete service brand.",
      tags: "bridal, private, pearl, mood, total brand",
      deadline: "2026-07-09",
    },
    {
      id: "idea-myuve-1",
      title: "MYUVE 5th-gen K-pop IP signature rule",
      rawIdea:
        "A K-pop IP system with identity codes that fans can recognize across teaser, merch, and content captions.",
      category: "Music/IP",
      linkedProjectId: "project-myuve",
      tasteFit: 8,
      portfolioPotential: 9,
      brandDepth: 8,
      monetizationPotential: 8,
      careerUsefulness: 8,
      currentStatus: "Needs Research",
      nextAction: "Compare 5th-gen teaser systems and list what is concrete versus over-abstract labeling.",
      reasonWhyThisMatters:
        "It connects music/IP taste with practical brand system thinking, useful for entertainment design roles.",
      tags: "kpop, ip, fan system, teaser, merch",
      deadline: "2026-07-12",
    },
    {
      id: "idea-workroom-1",
      title: "NAYUL WORKROOM as portfolio case",
      rawIdea:
        "Turn the app itself into a case study about converting scattered creative notes into project and career decisions.",
      category: "Portfolio",
      linkedProjectId: "project-workroom",
      tasteFit: 10,
      portfolioPotential: 10,
      brandDepth: 8,
      monetizationPotential: 5,
      careerUsefulness: 10,
      currentStatus: "Portfolio Candidate",
      nextAction: "Document before/after information architecture and decision workflow logic.",
      reasonWhyThisMatters:
        "It proves system thinking, product thinking, and personal creative direction in one project.",
      tags: "portfolio, product, workflow, creative director",
      deadline: "2026-07-03",
    },
  ],
  projects: [
    {
      id: "project-dollset",
      name: "DOLLSET",
      status: "Experimenting",
      deadline: "2026-07-14",
      category: "Brand",
      tasteFit: 9,
      portfolioPotential: 9,
      brandDepth: 8,
      monetizationPotential: 8,
      careerUsefulness: 7,
      coreIdentity:
        "A flash hotgirl dress brand with sharp confidence, night-out energy, and controlled sexiness.",
      target: "Young women who want party dresses that feel bold, direct, and image-ready.",
      problemIntention:
        "Create a fashion brand that feels daring without falling into cute, princess, or coquette cliches.",
      mustInclude:
        "Flash photography, chrome details, black or deep red accents, confident body language, direct styling.",
      mustAvoid:
        "Cute/princess/coquette mood, ribbon overload, soft bridal lace, doll-like innocence, cheap clubwear look.",
      visualCodes:
        "High flash contrast, cropped poses, silver zipper/chain details, black-red palette, sharp sans typography.",
      portfolioUsage:
        "Use as a fashion branding case about controlling seductive styling without losing brand precision.",
      deliverables: "Logo direction, lookbook grid, campaign prompt system, product page tone, launch captions.",
      nextMoves: [
        "Choose the main red/black/silver palette.",
        "Run 3 prompt experiments for flash dress campaign imagery.",
        "Write one brand rule that separates hotgirl from coquette.",
      ],
      standards: [
        {
          id: "std-dollset-1",
          title: "Hotgirl, not coquette",
          type: "Brand Rule",
          rule: "The brand can be flirtatious but must never become cute, princess-like, or ribbon-heavy.",
        },
        {
          id: "std-dollset-2",
          title: "Flash creates attitude",
          type: "Visual Rule",
          rule: "Use flash contrast and cropped movement to create energy instead of decorative styling.",
        },
      ],
      references: [
        {
          id: "ref-dollset-1",
          title: "Flash party editorial crop",
          whyItMatters: "The crop makes the product feel immediate and alive.",
          borrow: "Flash edge, body crop, black/silver contrast.",
          avoidCopying: "Do not copy celebrity styling or exact pose; borrow the energy system.",
          tags: "flash, fashion, crop",
        },
      ],
      resultReviews: [
        {
          id: "review-dollset-1",
          title: "First flash prompt review",
          score: 6,
          whatChanged: "Removed bows and softened lighting from the prompt.",
          decision: "Needs stronger chrome and less romantic styling.",
        },
      ],
    },
    {
      id: "project-nacre",
      name: "NACRE ROOM",
      status: "Developing",
      deadline: "2026-07-18",
      category: "Brand",
      tasteFit: 8,
      portfolioPotential: 8,
      brandDepth: 9,
      monetizationPotential: 7,
      careerUsefulness: 8,
      coreIdentity:
        "A private bridal mood total brand built around nacre, quiet rooms, and personal ceremony preparation.",
      target: "Brides who want an intimate and refined mood rather than generic wedding hall fantasy.",
      problemIntention:
        "Build a bridal brand that feels private and atmospheric without becoming princess fantasy.",
      mustInclude:
        "Pearl/nacre surface, private room mood, soft silver, quiet fabric movement, service totality.",
      mustAvoid:
        "Generic wedding hall, princess fantasy, overly sweet flowers, stock bridal poses, beige sameness.",
      visualCodes:
        "Nacre sheen, translucent veil layers, pale blue-grey shadow, soft silver line, editorial spacing.",
      portfolioUsage:
        "Use as a brand system case that translates mood into service, product, and content rules.",
      deliverables: "Brand DNA, service menu, reference decoder, campaign image rules, portfolio narrative.",
      nextMoves: [
        "Define what 'private bridal' means in one line.",
        "Decode 5 pearl/nacre references into visual codes.",
        "Test prompt direction that avoids princess fantasy.",
      ],
      standards: [
        {
          id: "std-nacre-1",
          title: "Private, not generic bridal",
          type: "Brand Rule",
          rule: "The atmosphere should feel like a personal room, not a wedding venue advertisement.",
        },
      ],
      references: [
        {
          id: "ref-nacre-1",
          title: "Nacre shell interior sheen",
          whyItMatters: "It gives bridal softness without becoming floral or princess-like.",
          borrow: "Pearl reflection, curved surface, quiet silver-blue light.",
          avoidCopying: "Do not turn it into literal shell decoration everywhere.",
          tags: "nacre, bridal, material",
        },
      ],
      resultReviews: [
        {
          id: "review-nacre-1",
          title: "Bridal direction risk check",
          score: 7,
          whatChanged: "Replaced wedding hall keywords with private room and material codes.",
          decision: "Promising, but needs clearer service/product deliverables.",
        },
      ],
    },
    {
      id: "project-myuve",
      name: "MYUVE",
      status: "Developing",
      deadline: "2026-07-22",
      category: "Music/IP",
      tasteFit: 8,
      portfolioPotential: 9,
      brandDepth: 8,
      monetizationPotential: 8,
      careerUsefulness: 8,
      coreIdentity:
        "A 5th-gen K-pop IP system where each visual code can become teaser, merch, caption, and fan memory.",
      target: "Entertainment design recruiters and fans who respond to recognizable identity systems.",
      problemIntention:
        "Make a K-pop IP concept that is concrete enough to use, not just abstract lore words.",
      mustInclude:
        "Repeatable symbol, fan-facing phrase, teaser grid, product extension, visual rule consistency.",
      mustAvoid:
        "Over-conceptual abstract labels, lore without design use, random futuristic effects, empty symbolism.",
      visualCodes:
        "Pale blue signal, chrome text edge, modular symbol, controlled motion blur, stage-to-merch continuity.",
      portfolioUsage:
        "Use as an entertainment/IP case showing how a concept becomes a usable identity system.",
      deliverables: "IP rulebook, teaser grid, merch mockups, caption system, fan content matrix.",
      nextMoves: [
        "List concrete visual rules fans could recognize.",
        "Create one symbol that works on teaser and merch.",
        "Write caption system rules without abstract lore overload.",
      ],
      standards: [
        {
          id: "std-myuve-1",
          title: "Lore must become an asset",
          type: "Visual Rule",
          rule: "Every concept word must map to a visual, product, caption, or fan behavior.",
        },
      ],
      references: [
        {
          id: "ref-myuve-1",
          title: "5th-gen teaser continuity",
          whyItMatters: "The same code repeats across teaser, merch, and fan edits.",
          borrow: "Repeatable mark, motion rule, caption tone.",
          avoidCopying: "Avoid copying group-specific symbols or fandom language.",
          tags: "kpop, teaser, fan",
        },
      ],
      resultReviews: [
        {
          id: "review-myuve-1",
          title: "Concept abstraction check",
          score: 5,
          whatChanged: "Removed vague labels and forced each keyword into a deliverable.",
          decision: "Needs stronger concrete asset system.",
        },
      ],
    },
    {
      id: "project-workroom",
      name: "NAYUL WORKROOM",
      status: "Portfolio Build",
      deadline: "2026-07-08",
      category: "Portfolio",
      tasteFit: 10,
      portfolioPotential: 10,
      brandDepth: 8,
      monetizationPotential: 5,
      careerUsefulness: 10,
      coreIdentity:
        "A personal creative director system that turns scattered ideas into project, portfolio, and career decisions.",
      target: "Design school reviewers, brand studio recruiters, and the designer herself.",
      problemIntention:
        "Stop treating notes as storage. Build a workflow that moves ideas into decisions and portfolio proof.",
      mustInclude:
        "Pipeline status, score logic, linked projects, experiment failures, portfolio builder aggregation.",
      mustAvoid:
        "Generic productivity app, Notion clone, shallow CRUD pages, corporate dashboard feeling.",
      visualCodes:
        "Ivory archive, pale blue signal, silver dividers, cherry decision marks, editorial cards.",
      portfolioUsage:
        "Use as a product/design system case about personal creative direction and information architecture.",
      deliverables: "Interactive MVP, workflow map, score logic, project studio, portfolio case builder.",
      nextMoves: [
        "Capture before/after information architecture.",
        "Show scoring utility and mock aggregation logic in the case study.",
        "Write interview talking points around why CRUD was not enough.",
      ],
      standards: [
        {
          id: "std-workroom-1",
          title: "Workflow over storage",
          type: "Brand Rule",
          rule: "Every saved item should help the next decision, not just become another card.",
        },
      ],
      references: [
        {
          id: "ref-workroom-1",
          title: "Editorial archive dashboard",
          whyItMatters: "It lets complex information feel private and composed.",
          borrow: "Large decision statement, numbered sections, thin silver rules.",
          avoidCopying: "Avoid making it a static magazine page; it still needs workflows.",
          tags: "editorial, archive, app",
        },
      ],
      resultReviews: [
        {
          id: "review-workroom-1",
          title: "CRUD depth review",
          score: 6,
          whatChanged: "Reduced page count and created project-linked modules.",
          decision: "The next version should show relationships and recommendations more clearly.",
        },
      ],
    },
  ],
  experiments: [
    {
      id: "exp-dollset-1",
      experimentTitle: "Flash hotgirl dress prompt",
      linkedProjectId: "project-dollset",
      experimentType: "Prompt",
      originalDirection:
        "A cute coquette party dress campaign with ribbons, flash photography, and pretty girl styling.",
      revisedDirection:
        "A flash hotgirl dress campaign with chrome zipper detail, black-red styling, confident body crop, direct camera flash, no bows.",
      resultRating: 6,
      whatWorked: "Flash and chrome detail started to feel like DOLLSET.",
      whatFailed: "The first version became too cute and coquette, weakening the brand edge.",
      failureTags: ["too cute", "brand DNA mismatch"],
      nextRevision:
        "Push flash contrast, reduce softness, and make the model posture sharper and less decorative.",
      usableForPortfolio: "Yes",
      createdAt: "2026-06-30",
    },
    {
      id: "exp-nacre-1",
      experimentTitle: "Private bridal moodboard text",
      linkedProjectId: "project-nacre",
      experimentType: "Visual Direction",
      originalDirection:
        "Elegant bridal hall with princess mood, white flowers, pearl details, and romantic lighting.",
      revisedDirection:
        "Private bridal preparation room with nacre sheen, translucent veil movement, soft silver line, pale blue-grey shadow.",
      resultRating: 7,
      whatWorked: "Private room and nacre material made the concept more ownable.",
      whatFailed: "Some wording still feels like generic bridal styling.",
      failureTags: ["too bridal", "too generic"],
      nextRevision:
        "Anchor the mood in material and service behavior instead of wedding hall imagery.",
      usableForPortfolio: "Yes",
      createdAt: "2026-06-29",
    },
    {
      id: "exp-myuve-1",
      experimentTitle: "MYUVE lore-to-asset test",
      linkedProjectId: "project-myuve",
      experimentType: "Product Idea",
      originalDirection:
        "A conceptual K-pop universe about memory waves, future icons, and abstract emotional signals.",
      revisedDirection:
        "A repeatable fan-facing symbol system where one pale blue signal mark appears in teaser, merch, caption, and fan edit frames.",
      resultRating: 5,
      whatWorked: "The repeated signal mark can become a real IP asset.",
      whatFailed: "The first direction used over-conceptual abstract labels without deliverables.",
      failureTags: ["too generic", "too flat", "not portfolio-worthy"],
      nextRevision:
        "Turn each concept word into a concrete object, motion rule, merch placement, or caption phrase.",
      usableForPortfolio: "No",
      createdAt: "2026-06-28",
    },
    {
      id: "exp-workroom-1",
      experimentTitle: "Portfolio case overview",
      linkedProjectId: "project-workroom",
      experimentType: "Portfolio Text",
      originalDirection:
        "NAYUL WORKROOM is a productivity dashboard for designers with tasks, projects, and money.",
      revisedDirection:
        "NAYUL WORKROOM is a private creative director system that converts ideas into project decisions, experiment revisions, portfolio proof, and career actions.",
      resultRating: 9,
      whatWorked: "The revised direction separates the project from generic productivity apps.",
      whatFailed: "The first version sounded like a normal dashboard and did not explain the workflow.",
      failureTags: ["too generic", "not portfolio-worthy"],
      nextRevision:
        "Add a before/after workflow map and show how scoring recommendations are generated.",
      usableForPortfolio: "Yes",
      createdAt: "2026-06-30",
    },
  ],
  portfolioCases: [
    {
      id: "case-workroom",
      projectId: "project-workroom",
      updatedAt: "2026-06-30",
      sections: {
        projectOverview:
          "A localStorage MVP for a personal creative director system, designed to move ideas through scoring, project linking, experiments, and portfolio aggregation.",
        problemIntention:
          "The first version felt like shallow CRUD. The redesign reframes saved data as workflow evidence and creative judgment.",
        target: "A designer/student preparing portfolio, brand direction, and career applications.",
        brandSystem:
          "Ivory archive, pale blue signal, silver dividers, cherry decision marks, editorial private studio tone.",
        visualDirection:
          "Project growth is shown through status badges, score meters, linked project chips, next actions, and failure-based revision prompts.",
        experiments:
          "Prompt failures and portfolio text revisions are connected to project DNA and reused inside the case structure.",
        deliverables:
          "Command Room, Idea Pipeline, Project Studio, Experiment Lab, Portfolio Builder.",
        portfolioDescription:
          "A private creative director system that turns scattered notes into design decisions and portfolio-ready narratives.",
        interviewTalkingPoints:
          "Why CRUD was insufficient; how scoring logic guides priorities; how project DNA shapes experiment revision; how local MVP can expand later.",
        nextExpansion:
          "Add visual uploads, project timelines, and exportable portfolio case pages after the workflow proves useful.",
      },
    },
  ],
};
