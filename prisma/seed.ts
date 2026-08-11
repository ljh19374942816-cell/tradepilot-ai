import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    slug: "atlas-power-station",
    nameEn: "Atlas 2000 Portable Power Station",
    nameZh: "Atlas 2000 户外储能电源",
    category: "Energy",
    summaryEn: "2,048Wh LiFePO4 power station for outdoor, backup and light commercial use.",
    summaryZh: "面向户外、应急与轻商用场景的 2,048Wh 磷酸铁锂储能电源。",
    description: "Pure sine wave 2400W output, 3500+ cycle LiFePO4 cells, UPS under 20ms, solar input up to 1200W, CE/FCC/RoHS/UN38.3 available. OEM logo, packaging and socket variants supported.",
    priceMin: 689, moq: 20, leadTime: "18-25 days",
    imageUrl: "/images/atlas-power.jpg",
    specs: { Capacity: "2,048Wh", Output: "2,400W", Chemistry: "LiFePO4", CycleLife: "3,500+ cycles", Warranty: "5 years" },
  },
  {
    slug: "nova-smart-charger",
    nameEn: "Nova 22kW Smart EV Charger",
    nameZh: "Nova 22kW 智能交流充电桩",
    category: "EV Charging",
    summaryEn: "OCPP-ready commercial wallbox with RFID, app control and dynamic load balancing.",
    summaryZh: "支持 OCPP、RFID、App 控制与动态负载均衡的商用交流充电桩。",
    description: "Single/three phase 7-22kW wallbox, IP65/IK10, OCPP 1.6J, Type 2 cable or socket, Wi-Fi/4G/Ethernet options. CE, CB and UKCA configurations are available.",
    priceMin: 238, moq: 50, leadTime: "25-30 days",
    imageUrl: "/images/nova-charger.jpg",
    specs: { Power: "7/11/22kW", Protocol: "OCPP 1.6J", Protection: "IP65 / IK10", Connectivity: "Wi-Fi, 4G, Ethernet", Warranty: "3 years" },
  },
  {
    slug: "airguard-monitor",
    nameEn: "AirGuard Pro Indoor Air Monitor",
    nameZh: "AirGuard Pro 室内空气质量监测仪",
    category: "Smart Home",
    summaryEn: "Six-in-one air quality monitor with Tuya integration and custom firmware options.",
    summaryZh: "六合一空气质量监测设备，支持涂鸦生态与定制固件。",
    description: "Real-time PM2.5, CO2, TVOC, temperature, humidity and AQI monitoring. USB-C powered, 3.5-inch IPS display, optional Wi-Fi and Tuya integration. Private label and firmware localization supported.",
    priceMin: 29, moq: 500, leadTime: "15-22 days",
    imageUrl: "/images/airguard.jpg",
    specs: { Sensors: "PM2.5 / CO2 / TVOC", Display: "3.5-inch IPS", Connectivity: "Wi-Fi optional", Languages: "12", Warranty: "2 years" },
  },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@tradepilot.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  await prisma.admin.upsert({
    where: { email },
    update: { name: "Sales Admin", passwordHash: await bcrypt.hash(password, 12) },
    create: { email, name: "Sales Admin", passwordHash: await bcrypt.hash(password, 12) },
  });
  for (const product of products) {
    await prisma.product.upsert({ where: { slug: product.slug }, update: product, create: product });
  }
  console.log(`Seed complete: ${products.length} products and admin ${email}`);
}

main().finally(() => prisma.$disconnect());
