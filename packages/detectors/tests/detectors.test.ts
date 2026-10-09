import { describe, expect, it } from "vitest";
import { detectFormat, findMarkdownMarkup, looksLikeMarkdown, normalizeForDetection } from "../src/index.js";

const markdownSample = [
  "# Sample Heading",
  "",
  "- Item one",
  "- Item two",
  "",
  "Here is some **bold text** and a code block:",
  "",
  "```",
  'console.log("hello world");',
  "```",
  "",
].join("\n");

const htmlSample = [
  '<div class="note">',
  "  <h1>Sample Heading</h1>",
  "  <p>This is a paragraph with a <strong>bold</strong> word.</p>",
  "  <ul>",
  "    <li>Item one</li>",
  "    <li>Item two</li>",
  "  </ul>",
  "</div>",
].join("\n");

const plainSample = [
  "This is a plain text paragraph with no special formatting signals.",
  "It spans multiple lines to resemble copied text.",
].join("\n");

describe("detectFormat", () => {
  it("detects HTML with high confidence", () => {
    const result = detectFormat(htmlSample);
    expect(result.format).toBe("html");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("detects Markdown with high confidence", () => {
    const result = detectFormat(markdownSample);
    expect(result.format).toBe("markdown");
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("detects plain text when no strong signals", () => {
    const result = detectFormat(plainSample);
    expect(result.format).toBe("plain");
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("avoids classifying generics or comparisons as HTML", () => {
    const genericSnippet = "Map<T> should not look like HTML";
    const comparisonSnippet = "a < b and c > d";

    const genericResult = detectFormat(genericSnippet);
    const comparisonResult = detectFormat(comparisonSnippet);

    expect(genericResult.format).not.toBe("html");
    expect(comparisonResult.format).not.toBe("html");
  });

  it("prefers HTML when mixed content includes strong tags", () => {
    const mixed = "Here is text before a tag <div><p>content</p></div> and after";
    const result = detectFormat(mixed);
    expect(result.format).toBe("html");
  });

  it("is deterministic for identical input", () => {
    const normalized = normalizeForDetection(markdownSample);
    const first = detectFormat(normalized);
    const second = detectFormat(normalized);
    expect(first).toStrictEqual(second);
  });
});

// P2 signaal 3 (on-the-fly variant): zonder expliciet PDF-signaal mag reflow
// alleen bij overweldigend bewijs — regels die midden in een zin afbreken en
// met een kleine letter doorgaan. Gedichten/adressen doen dat niet.
describe("looksLikePdfReflowStrict", () => {
  const paragraphLines = (lines: string[]) =>
    lines.map((line) => ({
      type: "paragraph" as const,
      children: [{ type: "text" as const, text: line }],
    }));

  const pdfProse = [
    "Machine learning is a subset of artificial intelligence that focuses on",
    "building systems that can learn from data without being explicitly",
    "programmed to perform a task. Rather than following fixed rules, these",
    "systems use statistical algorithms to identify patterns in large datasets",
    "and improve their performance over time as they process more examples.",
    "The field has grown rapidly in recent years thanks to advances in",
    "computing power, the availability of massive datasets, and improved",
    "algorithms that can train much deeper neural networks than before.",
  ];

  const poem = [
    "The morning light falls gently on the quiet harbor town",
    "Where fishing boats are resting on the water calm and still",
    "A seagull circles slowly high above the wooden pier",
    "And somewhere in the distance rings a lonely chapel bell",
    "The nets are hanging heavy from the beams along the dock",
    "While fishermen are mending what the storm has torn apart",
    "The salty air is carrying the stories of the sea",
    "To every open window on the street along the shore",
  ];

  it("fires on line-wrapped pdf prose (lowercase continuations)", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    expect(looksLikePdfReflowStrict(paragraphLines(pdfProse))).toBe(true);
  });

  it("does not fire on a poem (self-contained lines)", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    expect(looksLikePdfReflowStrict(paragraphLines(poem))).toBe(false);
  });

  it("does not fire on short chat-like lines", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    const chat = ["yo man", "still in casablanca?", "yeah around the corner",
      "come thru", "bet", "on my way now", "cool see you", "in five minutes"];
    expect(looksLikePdfReflowStrict(paragraphLines(chat))).toBe(false);
  });

  it("does not fire on an address block (too few lines)", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    const address = ["Jan Jansen", "Kerkstraat 12", "1234 AB Amsterdam", "Nederland"];
    expect(looksLikePdfReflowStrict(paragraphLines(address))).toBe(false);
  });
});

// FINDINGS E13(3): de linkregex scande bij elke "[" tot het einde (20k "[" → 1 s).
describe("looksLikeMarkdown is lineair op rechte haken (E13)", () => {
  it("herkent een lijst met een link nog steeds", () => {
    expect(looksLikeMarkdown("- zie [docs](https://example.invalid/d)\n- en [meer](https://example.invalid/m)")).toBe(true);
  });

  it("blijft snel op 20k rechte haken", () => {
    const started = performance.now();
    expect(looksLikeMarkdown(`- a\n- b\n${"[".repeat(20_000)}`)).toBe(false);
    expect(performance.now() - started).toBeLessThan(100);
  });
});

// E20 (P2.8): platte tekst met `#`-commentaar, een los `~~~` of een chatbericht
// is geen Markdown. Alle teksten zijn synthetisch.
describe("looksLikeMarkdown", () => {
  const lines = (...parts: string[]) => parts.join("\n");

  it("ziet een shell-script met #-commentaar niet als Markdown", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("# install deps", "npm install", "# build", "npm run prepare"))).toBe(false);
  });

  it("ziet Python-commentaar niet als Markdown", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(
      looksLikeMarkdown(lines("# Load the data", "df = read_csv(path)", "# Train the model", "model.fit(df)"))
    ).toBe(false);
  });

  it("ziet een script met shebang nooit als Markdown", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("#!/bin/sh", "# setup", "", "# run", "", "make"))).toBe(false);
  });

  it("ziet een changelog in platte tekst niet als Markdown", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("1.2.0", "* fix: login", "1.1.0", "* feat: export"))).toBe(false);
  });

  it("ziet een los ~~~ (terminal of scheidingslijn) niet als code-fence", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("Uitslag:", "~~~", "alles groen"))).toBe(false);
  });

  it("ziet ~~~ met sluit-fence wél als Markdown", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("Voorbeeld:", "~~~", "echo hi", "~~~"))).toBe(true);
  });

  it("ziet een ```-fence als Markdown", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("Voorbeeld:", "```", "echo hi", "```"))).toBe(true);
  });

  it("ziet twee losse koppen (gevolgd door een lege regel) als Markdown", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("# Titel", "", "Tekst.", "", "# Tweede", "", "Meer tekst."))).toBe(true);
  });

  it("ziet ## zonder lege regel erna als kop (LLM-uitvoer)", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("## Samenvatting", "- punt een", "- punt twee"))).toBe(true);
  });

  it("ziet een chatbericht met een lijstje nog steeds als Markdown (de lijst is echt)", async () => {
    const { looksLikeMarkdown } = await import("../src/index.js");
    expect(looksLikeMarkdown(lines("Hi team,", "please review:", "", "- item one", "- item two", "", "Thanks"))).toBe(true);
  });
});

// P2.58 (E90, F1 van de review van #144): welke Markdown-opmaak toont een app die Markdown niet opmaakt letterlijk,
// zodat de encoder haar verbetert? Alles anders (lijsten, vet, code, kale URL's) is geen reden om te herschrijven.
// Alle teksten zijn synthetisch.
describe("findMarkdownMarkup", () => {
  it("geeft niets voor lege tekst of alleen witruimte", () => {
    expect(findMarkdownMarkup("")).toEqual([]);
    expect(findMarkdownMarkup("  \n\t\n ")).toEqual([]);
  });

  it.each([
    ["een kop", "# Kop", ["heading"]],
    ["een kop van niveau 6 met inspringing", "   ###### Kop", ["heading"]],
    ["een kop midden in de tekst", "Tekst.\n\n## Kop\n\nMeer tekst.", ["heading"]],
    ["een citaat", "> Citaat", ["quote"]],
    ["een citaat zonder spatie", ">Citaat", ["quote"]],
    ["een genest citaat", ">> Citaat", ["quote"]],
    ["een link", "Zie [de pagina](https://example.test/p).", ["link"]],
    ["een link met titel", 'Zie [de pagina](https://example.test/p "titel").', ["link"]],
    ["een link met haakjes in de URL (Wikipedia)", "Zie [Foo](https://en.wikipedia.org/wiki/Foo_(bar)).", ["link"]],
    ["een afbeelding met haakjes in de URL", "![Foo](https://en.wikipedia.org/wiki/Foo_(bar).png)", ["image"]],
    ["een afbeelding (en dus niet ook een link)", "![plaatje](https://example.test/i.png)", ["image"]],
    ["een afbeelding zonder alt-tekst", "![](https://example.test/i.png)", ["image"]],
    ["een afbeelding en een link", "![a](https://e.test/i.png) en [b](https://e.test/p)", ["image", "link"]],
    ["cursief met underscores", "Een _cursief_ woord.", ["italic"]],
    ["cursief met sterretjes", "Een *cursief* woord.", ["italic"]],
    ["cursief aan het begin van de regel", "_cursief_ aan het begin", ["italic"]],
    ["cursief voor een leesteken", "Echt waar, _nee_!", ["italic"]],
    ["cursief tussen haakjes", "Zie (_de bijlage_) hierboven.", ["italic"]],
    ["cursief met meer woorden", "Een _heel mooi_ woord.", ["italic"]],
    ["cursief met één teken", "Dat is _a_ of b.", ["italic"]],
  ] as const)("ziet %s", (_naam, tekst, verwacht) => {
    expect(findMarkdownMarkup(tekst)).toEqual(verwacht);
  });

  it("geeft de soorten in een vaste volgorde, elk één keer", () => {
    const tekst = "Een _a_ en een *b* en [c](https://e.test/c) en ![d](https://e.test/d).\n\n> Citaat\n\n# Kop";
    expect(findMarkdownMarkup(tekst)).toEqual(["heading", "quote", "image", "link", "italic"]);
  });

  it.each([
    ["vet met sterretjes", "Dit is **belangrijk** nieuws."],
    ["vet met underscores", "Dit is __belangrijk__ nieuws."],
    ["doorgehaald", "Dit is ~~oud~~ nieuws."],
    ["inline code", "Draai `pnpm test` nu."],
    ["een lijst met streepjes", "- een\n- twee"],
    ["een lijst met sterretjes", "* een\n* twee"],
    ["een genummerde lijst", "1. een\n2. twee"],
    ["een kale URL met underscores", "Zie https://example.test/a_b_c?x=_y_ voor meer."],
    ["een mailadres", "Mail jan@example.nl voor meer."],
    ["snake_case en een dunder", "De variabele snake_case_naam en __init__ blijven."],
    ["een vermenigvuldiging met spaties", "Reken 2 * 3 * 4 uit."],
    ["een vermenigvuldiging zonder spaties", "Reken 2*3*4 uit."],
    ["een glob", "rm -rf build/* dist/*"],
    ["een sterretje met een spatie erna", "Dat is a * b* c"],
    ["een sterretje met een spatie ervoor aan de sluitkant", "Dat is a *b * c"],
    ["een underscore met een spatie erna", "Dat is a _ b_ c"],
    ["een underscore met een spatie ervoor aan de sluitkant", "Dat is a _b _ c"],
    ["rechte haken zonder URL", "Kies [ja] of [nee] (zie hierboven)."],
    ["een link met een spatie tussen tekst en URL", "Zie [tekst] (https://example.test/p)."],
    // Bewust: het URL-deel stopt bij een `[` om de scan lineair te houden. Een geldige bestemming met een `[` erin
    // (CommonMark staat dat toe) is dus geen opmaak; bij twijfel blijft de tekst staan.
    ["een URL met een rechte haak erin", "Zie [a](https://example.test/[b])."],
    ["een hekje zonder spatie", "Dat is #hashtag in C# en F#."],
    ["een hashtag aan het begin van de regel", "#hashtag aan het begin\nen #nog een"],
    ["zeven hekjes (geen kop)", "####### zeven"],
    ["een lege kop", "#\n# \nTekst"],
    ["een pijl en een vergelijking", "a -> b en x >= 5 en 3 > 2"],
    ["een quote-teken zonder inhoud", ">\nTekst"],
    ["een regel met vier spaties ervoor (code)", "Tekst\n\n    > niet\n    # ook niet"],
    ["streepjes als lijn", "-----\nTekst"],
  ] as const)("ziet %s niet als opmaak", (_naam, tekst) => {
    expect(findMarkdownMarkup(tekst)).toEqual([]);
  });

  describe("code telt niet mee: daar is het teken met opzet letterlijk", () => {
    it.each([
      ["een codeblok met backticks", "```\n# kop\n> citaat\n_x_ en [a](b)\n```"],
      ["een codeblok met tildes", "~~~\n# kop\n> citaat\n~~~"],
      ["een codeblok met een taal", "```bash\n# commentaar\necho _x_\n```"],
      ["een niet gesloten codeblok loopt tot het einde", "```\n# commentaar\n> citaat"],
      ["een lang blok sluit niet met een korter hek", "````\n```\n# kop\n````"],
      ["een hek van een andere soort sluit niet", "```\n~~~\n# kop\n```"],
      ["inline code", "Draai `_x_` en `[a](b)` en `# kop` nu."],
    ] as const)("%s", (_naam, tekst) => {
      expect(findMarkdownMarkup(tekst)).toEqual([]);
    });

    it("opmaak buiten de code telt wél", () => {
      expect(findMarkdownMarkup("# Echte kop\n```\n# commentaar\n```")).toEqual(["heading"]);
      expect(findMarkdownMarkup("```\n# commentaar\n```\n# Echte kop")).toEqual(["heading"]);
      expect(findMarkdownMarkup("Echt _cursief_ en `_code_`.")).toEqual(["italic"]);
    });
  });

  it("neemt Windows-regeleinden en een BOM mee", () => {
    expect(findMarkdownMarkup("\uFEFF# Kop\r\n\r\n- a")).toEqual(["heading"]);
    expect(findMarkdownMarkup("Tekst\r\n\r\n> Citaat")).toEqual(["quote"]);
  });

  // Lineair op vijandige invoer, zoals looksLikeMarkdown (E13(3)). Gemeten voor de linkregex op 50.000 rechte haken:
  // kwadratisch (`[^\]]` in plaats van `[^[\]]`) 1,5 s, lineair 0,1 ms; de grens is dus ruim. Veel groter maken helpt niet,
  // want een kwadratische scan blokkeert de testrunner dan zonder dat de timeout van de test hem kan onderbreken.
  // Het URL-deel van een link of afbeelding moet ook bij de volgende `[` stoppen (tweede review van #144): `[a](b` x
  // 20.000 duurde met `[^)\s]+` zo'n 2 s en `![a](b` x 20.000 zo'n 7 s, op de main thread van de webview.
  it.each([
    ["rechte haken", "[".repeat(50_000)],
    ["afbeeldingen zonder sluiting", "![".repeat(25_000)],
    ["links zonder sluit-haakje", "[a](b".repeat(20_000)],
    ["afbeeldingen zonder sluit-haakje", "![a](b".repeat(20_000)],
    ["openers van cursief zonder sluiter", "_a ".repeat(20_000)],
    ["sterretjes met een letter erachter", "*a ".repeat(20_000)],
    ["backticks", "`".repeat(50_000)],
  ] as const)("blijft lineair op %s", (_naam, tekst) => {
    const started = performance.now();
    expect(findMarkdownMarkup(tekst)).toEqual([]);
    expect(performance.now() - started).toBeLessThan(250);
  });
});
