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

  // Model photos for the home page. Add more files to img/look/ or upload them on the site.
  lookbook: ["l01", "l02", "l03", "l04"],

  // Board page, laid out like the Canva board
  boardMain: ["34", "16", "30", "20", "32", "15", "10", "28", "33", "14"],
  boardMore: [["05", "02", "13", "08"], ["17", "03", "22", "07"], ["21", "23", "27"], ["06", "18", "31", "24", "26"]],
  imgRatio: {"03": 0.672, "26": 0.832, "14": 1.112, "28": 0.743, "32": 0.762, "20": 0.796, "07": 0.562, "05": 1.198, "31": 1.05, "15": 0.788, "13": 0.775, "08": 0.561, "23": 0.958, "10": 0.561, "22": 0.749, "06": 1.129, "30": 1.075, "18": 1.234, "24": 0.834, "02": 0.607, "34": 0.779, "16": 1.239, "17": 1.202, "21": 1.0, "33": 0.799, "27": 0.832},
  keyPieces: "Boxy tees, heavy hoodies, thermal longsleeves, wide-leg denim, graphic sweatpants",

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

  // Every piece from the board. Kenny's designs for each piece show on its page.
  pieces: [
    { id: "p01", name: "Washed boxy tee", type: "Tees", status: "Idea", refs: ["34"] },
    { id: "p02", name: "Cracked type tee", type: "Tees", status: "Idea", refs: ["16"] },
    { id: "p03", name: "Faded script-oval tee", type: "Tees", status: "Idea", refs: ["18"] },
    { id: "p04", name: "Cream ringer tee", type: "Tees", status: "Idea", refs: ["10"] },
    { id: "p05", name: "Racing jersey tee", type: "Tees", status: "Idea", refs: ["13"] },
    { id: "p06", name: "Brushstroke tank", type: "Tanks", status: "Idea", refs: ["28"] },
    { id: "p07", name: "Gothic rib tank", type: "Tanks", status: "Idea", refs: ["31"] },
    { id: "p08", name: "Gothic thermal longsleeve", type: "Longsleeves", status: "Idea", refs: ["20"] },
    { id: "p09", name: "Chest script longsleeve", type: "Longsleeves", status: "Idea", refs: ["30"] },
    { id: "p10", name: "Sleeve script longsleeve", type: "Longsleeves", status: "Idea", refs: ["33"] },
    { id: "p11", name: "Number grid longsleeve", type: "Longsleeves", status: "Idea", refs: ["21"] },
    { id: "p12", name: "Faded print longsleeve", type: "Longsleeves", status: "Idea", refs: ["23"] },
    { id: "p13", name: "Red print racing longsleeve", type: "Longsleeves", status: "Idea", refs: ["05"] },
    { id: "p14", name: "Mohair script sweater", type: "Knits", status: "Idea", refs: ["22"] },
    { id: "p15", name: "Face print hoodie", type: "Hoodies", status: "Idea", refs: ["32"] },
    { id: "p16", name: "Cracked logo hoodie", type: "Hoodies", status: "Idea", refs: ["17"] },
    { id: "p17", name: "Grey zip hoodie", type: "Hoodies", status: "Idea", refs: ["06"] },
    { id: "p18", name: "Studded hood jacket", type: "Outerwear", status: "Idea", refs: ["02"] },
    { id: "p19", name: "Leather hood jacket", type: "Outerwear", status: "Idea", refs: ["03"] },
    { id: "p20", name: "Fishbone bleach jeans", type: "Bottoms", status: "Idea", refs: ["15"] },
    { id: "p21", name: "Paisley panel jeans", type: "Bottoms", status: "Idea", refs: ["08"] },
    { id: "p22", name: "Olive asymmetric-fly pants", type: "Bottoms", status: "Idea", refs: ["14"] },
    { id: "p23", name: "Gothic sweatpants", type: "Bottoms", status: "Idea", refs: ["26"] },
    { id: "p24", name: "Bone patch jorts", type: "Bottoms", status: "Idea", refs: ["27"] },
    { id: "p25", name: "Script sweat shorts", type: "Bottoms", status: "Idea", refs: ["24"] },
    { id: "p26", name: "Engraved lighter", type: "Objects", status: "Idea", refs: ["07"] }
  ],

  pieceSpec: ["Fit", "Fabric", "Weight", "Print", "Wash"]
};
