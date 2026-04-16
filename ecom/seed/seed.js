require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function main() {
  const conn = await mysql.createConnection({
    host: requireEnv("DB_HOST"),
    port: Number(process.env.DB_PORT || 3306),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    multipleStatements: true,
  });

  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  console.log("Applying schema...");
  await conn.query(schemaSql);

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const users = [
    { id: uuidv4(), name: "Ishan", email: "ishan@example.com", password_hash: passwordHash },
    { id: uuidv4(), name: "Demo User", email: "demo@example.com", password_hash: passwordHash },
  ];

  for (const u of users) {
    await conn.execute(
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash)",
      [u.id, u.name, u.email, u.password_hash],
    );
  }

  console.log("Seeding products...");
  const products = buildProducts();

  for (const p of products) {
    await conn.execute(
      "INSERT INTO products (id, name, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price), image_url=VALUES(image_url), stock=VALUES(stock)",
      [p.id, p.name, p.description, p.price, p.image_url, p.stock],
    );
  }

  const [[{ userCount }]] = await conn.query("SELECT COUNT(*) AS userCount FROM users");
  const [[{ productCount }]] = await conn.query("SELECT COUNT(*) AS productCount FROM products");

  console.log(`Seed complete. users=${userCount} products=${productCount}`);
  await conn.end();
}

function buildProducts() {
  const base = [
    ["ChronoSteel", "Stainless steel chronograph with tachymeter bezel.", 199.99],
    ["OceanDive 200", "200m water resistance with sapphire glass.", 249.5],
    ["Minimal Noir", "Ultra-thin dress watch with matte black dial.", 129.0],
    ["Heritage Classic", "Vintage-inspired domed crystal and leather strap.", 159.75],
    ["AeroPilot GMT", "Dual-time GMT watch for frequent flyers.", 279.0],
    ["SolarPulse", "Solar-powered everyday watch with day-date.", 189.0],
    ["FieldPro", "Rugged field watch with luminous numerals.", 99.99],
    ["Ceramic Edge", "Scratch-resistant ceramic bezel and bracelet.", 329.0],
    ["Aurora Rose", "Rose-gold tone case with minimalist markers.", 149.0],
    ["TitanLite", "Lightweight titanium case, anti-reflective coating.", 299.0],
    ["Urban Square", "Square case with integrated bracelet.", 139.0],
    ["NightRunner", "Sporty chronograph with high-contrast subdials.", 219.0],
    ["Glacier Blue", "Ice-blue dial with applied indices.", 169.0],
    ["Carbon Track", "Carbon-fiber dial with racing strap.", 259.0],
    ["Eclipse Moonphase", "Moonphase complication with polished case.", 349.0],
    ["SmartHybrid", "Analog look with smart tracking features.", 229.0],
    ["Sailor Navi", "Nautical bezel, strong lume, screw-down crown.", 239.0],
    ["Vintage Gold", "Gold-tone dress watch with textured dial.", 119.0],
    ["Metro Mesh", "Mesh bracelet with clean Scandinavian design.", 109.0],
    ["Pulse Sport", "Silicone strap, stopwatch, and alarms.", 79.0],
    ["Executive Slate", "Slate dial, date window, leather strap.", 149.99],
    ["Desert Sand", "Sand dial with canvas strap for casual wear.", 89.0],
    ["Arctic Explorer", "High-lume explorer dial with 24h track.", 199.0],
    ["Diamond Minute", "Subtle crystal accents for a premium finish.", 179.0],
    ["Retro Digital", "Classic digital watch with backlight.", 49.0],
  ];

  return base.map(([name, description, price], i) => ({
    id: uuidv4(),
    name,
    description,
    price,
    image_url: null,
    stock: 10 + (i % 7) * 5,
  }));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

