// Everything the site shows lives here. Edit this file to change the plan,
// the board, the style guide or the pieces. Dates are YYYY-MM-DD.

window.SITE = {
  workingName: "Untitled",
  dropDate: "2027-05-22",
  canvaBoard: "https://canva.link/7gc1exwu0dkwbzu",

  team: [
    { id: "amani", name: "Amani", role: "Role to agree" },
    { id: "jeet",  name: "Jeet",  role: "Role to agree" },
    { id: "kenny", name: "Kenny", role: "Design" }
  ],

  // owner: "amani" | "jeet" | "kenny" | "all" | null (nobody yet)
  // done: set to true when a step is finished
  phases: [
    { name: "Brand", tasks: [
      { t: "Shortlist 5 names and vote as a team", s: "2026-11-24", e: "2026-11-27", owner: "all", note: "Start from the names in the running on the home page." },
      { t: "Check IG and TikTok handles, domain and trademark", s: "2026-11-28", e: "2026-11-30", owner: null, note: "Search the name on PDKI. It has to be free everywhere." },
      { t: "Lock the name", s: "2026-12-01", e: "2026-12-01", owner: "all" },
      { t: "Agree roles, budget and profit split", s: "2026-12-02", e: "2026-12-04", owner: "all", note: "Write it down: who does design, production, content and sales." },
      { t: "Claim the IG and TikTok accounts", s: "2026-12-05", e: "2026-12-06", owner: null, note: "Claim the handles now and post later." },
      { t: "Logo, wordmark, neck label and hangtag", s: "2026-12-07", e: "2026-12-18", owner: "kenny" },
      { t: "Register the trademark at DJKI", s: "2026-12-19", e: "2026-12-21", owner: null, note: "Optional, but it protects the name." }
    ]},
    { name: "Product", tasks: [
      { t: "Pick 3 or 4 pieces for Drop 1", s: "2026-12-22", e: "2026-12-24", owner: "all", note: "Choose from the Pieces page." },
      { t: "Design the graphics and prints", s: "2026-12-25", e: "2027-01-10", owner: "kenny", note: "Extra days for Christmas and New Year." },
      { t: "Tech pack for each piece", s: "2027-01-11", e: "2027-01-17", owner: "kenny", note: "Size chart, fabric and weight, print placement, wash." },
      { t: "Cost per piece and retail price", s: "2027-01-18", e: "2027-01-21", owner: null, note: "A common rule: retail at about 2.5 to 3 times cost." }
    ]},
    { name: "Sourcing", tasks: [
      { t: "Visit 3 or more konveksi and printers, get quotes and minimums", s: "2027-01-22", e: "2027-02-04", owner: null, note: "Bandung: Cigondewah for fabric, Suci for screen printing." },
      { t: "Order first samples, with a wash and distress test", s: "2027-02-05", e: "2027-02-21", owner: null, note: "Ramadan starts around 8 Feb and konveksi get busy. Book early." },
      { t: "Review samples, fix, second sample round", s: "2027-02-22", e: "2027-03-05", owner: "all", note: "Most brands need two rounds." }
    ]},
    { name: "Break", isBreak: true, tasks: [
      { t: "Lebaran break", s: "2027-03-06", e: "2027-03-15", owner: null, note: "Vendors and couriers are off." }
    ]},
    { name: "Production", tasks: [
      { t: "Order labels, hangtags and packaging", s: "2027-03-16", e: "2027-03-26", owner: null },
      { t: "Approve final samples, pay the deposit, bulk run", s: "2027-03-27", e: "2027-04-17", owner: null, note: "After Lebaran the konveksi are less busy." },
      { t: "Quality check, fold and pack the stock", s: "2027-04-18", e: "2027-04-22", owner: "all" }
    ]},
    { name: "Content", tasks: [
      { t: "Lookbook photoshoot", s: "2027-04-23", e: "2027-04-27", owner: null, note: "Shoot the real stock." },
      { t: "Set up the store, product pages and size charts", s: "2027-04-28", e: "2027-05-04", owner: null, note: "Shopee, Tokopedia or a website." },
      { t: "Teaser posts and drop countdown", s: "2027-05-05", e: "2027-05-21", owner: null, note: "Use the lookbook photos." }
    ]},
    { name: "Launch", tasks: [
      { t: "Drop 1", s: "2027-05-22", e: "2027-05-22", owner: "all", isDrop: true },
      { t: "Pack and ship the orders", s: "2027-05-23", e: "2027-05-29", owner: "all" },
      { t: "Review sales and feedback, plan Drop 2", s: "2027-05-30", e: "2027-06-05", owner: "all" }
    ]}
  ],

  names: ["Grisaille", "Mortain", "Van Ossel", "Saint Cendre", "Killingsworth", "Van der Void"],

  board: [
    { name: "Faded and washed", note: "Sun-faded, darker toward the hem. Frayed collars and small holes.", imgs: ["34", "18", "06", "23", "26"] },
    { name: "Gothic and script", note: "Tonal blackletter embroidery, flowing script across the chest and down the sleeves.", imgs: ["20", "31", "30", "33", "24", "22"] },
    { name: "Cracked type", note: "Big condensed letters, printed so they crack and wear.", imgs: ["16", "17", "28", "21", "13"] },
    { name: "Prints", note: "One strong image. Oxblood on cream, white on washed black.", imgs: ["10", "05", "32"] },
    { name: "Bones, denim and workwear", note: "Bone patches, bleach prints, olive canvas with an asymmetric fly.", imgs: ["15", "27", "08", "14"] },
    { name: "Outerwear and objects", note: "Hoods, leather, engraved metal.", imgs: ["03", "02", "07"] }
  ],

  palette: [
    { name: "Washed black", hex: "#1A1A1A" },
    { name: "Charcoal",     hex: "#3A3A3A" },
    { name: "Faded grey",   hex: "#8C8C8C" },
    { name: "Bone",         hex: "#EDE6D6" },
    { name: "Oxblood",      hex: "#7A1E22" },
    { name: "Olive drab",   hex: "#5E5B45" }
  ],

  keywords: ["Washed", "Distressed", "Gothic", "Script", "Bone", "Oversized"],

  details: [
    "Sun-faded wash, darker toward the hem",
    "Frayed collars, raw hems, small holes",
    "Tonal gothic embroidery and blackletter",
    "Flowing script across the chest and sleeves",
    "Bone and skeleton patches, bleach prints",
    "Cracked, distressed screen prints",
    "Contrast ringer trims, cream with black",
    "Olive workwear with an asymmetric fly",
    "Boxy, cropped, oversized fits"
  ],

  // Drop 1 candidates. Kenny's designs for each piece show on its page.
  pieces: [
    { id: "p01", name: "Washed boxy tee", status: "Idea", refs: ["34", "16", "28"],
      spec: { Fit: "Boxy, cropped", Fabric: "To decide", Weight: "To decide", Print: "Cracked type on the back", Wash: "Sun-faded, darker hem" } },
    { id: "p02", name: "Heavy hoodie", status: "Idea", refs: ["32", "17", "06"],
      spec: { Fit: "Oversized, short body", Fabric: "To decide", Weight: "To decide", Print: "One strong image on the front", Wash: "Washed black" } },
    { id: "p03", name: "Thermal longsleeve", status: "Idea", refs: ["20", "30", "33"],
      spec: { Fit: "Relaxed, long sleeves", Fabric: "Waffle thermal", Weight: "To decide", Print: "Tonal blackletter or sleeve script", Wash: "To decide" } },
    { id: "p04", name: "Wide-leg denim", status: "Idea", refs: ["15", "27", "08"],
      spec: { Fit: "Wide, stacked", Fabric: "Denim", Weight: "To decide", Print: "Bone patch or bleach print", Wash: "Faded" } },
    { id: "p05", name: "Graphic sweatpants", status: "Idea", refs: ["26", "24"],
      spec: { Fit: "Balloon leg, cuffed", Fabric: "Fleece", Weight: "To decide", Print: "Gothic lettering down one leg", Wash: "Washed charcoal" } }
  ]
};
