import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Aeromach catalog...');

  // Clean existing development products to ensure clean seed
  await prisma.orderItem.deleteMany();
  await prisma.fulfillmentJob.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  const productsData = [
    {
      slug: 'turbofan-schematic-tee',
      title: 'The Turbofan Schematic T-Shirt',
      subtitle: 'High-bypass axial flow turbofan CAD blueprint linework',
      description: 'Engineered from precision CAD line-art depicting the dual-spool high-bypass axial turbofan engine. Featuring annotated station numbers (0-8), compressor stages, annular combustor, and mixed-flow convergent exhaust nozzle.',
      category: 'schematic',
      specifications: JSON.stringify({
        cut: 'Retail Modern Fit / Unisex',
        fabric: '100% Airlume Combed Ring-Spun Cotton',
        weight: '142 GSM / 4.2 oz/yd²',
        weave: '32 Singles jersey knit',
        features: 'Shoulder-to-shoulder taping, side-seamed construction',
        printMethod: 'Direct-to-Garment (DTG) with neo-pigment water-based inks'
      }),
      careInstructions: 'Machine wash warm, inside out, with like colours. Tumble dry low or air dry. Do not iron directly on technical print. Do not dry clean.',
      images: JSON.stringify([
        '/products/turbofan-black.svg',
        '/products/turbofan-detail.svg'
      ]),
      basePrice: 1499.00,
      currency: 'INR',
      isPublished: true,
      isFeatured: true,
      printifyProductId: 'pf_prod_turbofan_01',
      printifyBlueprintId: 12, // Bella+Canvas 3001
      printifyProviderId: 29,
      variants: [
        { size: 'S', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12001 },
        { size: 'M', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12002 },
        { size: 'L', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12003 },
        { size: 'XL', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12004 },
        { size: '2XL', color: 'Pitch Black', colorHex: '#0D1117', price: 1599, costPrice: 920, printifyVariantId: 12005 },
        { size: 'M', color: 'Titanium White', colorHex: '#F8FAFC', price: 1499, costPrice: 850, printifyVariantId: 12012 },
        { size: 'L', color: 'Titanium White', colorHex: '#F8FAFC', price: 1499, costPrice: 850, printifyVariantId: 12013 },
      ]
    },
    {
      slug: 'naca-0012-airfoil-hoodie',
      title: 'NACA 0012 Airfoil Technical Hoodie',
      subtitle: 'Symmetrical section aerodynamics & boundary layer streamlines',
      description: 'Detailed camber-line and thickness distribution coordinates for the legendary NACA 0012 profile. Features streamlines transitioning from laminar to turbulent boundary layer, stagnation point notation, and lift slope equation.',
      category: 'schematic',
      specifications: JSON.stringify({
        cut: 'Classic Heavyweight Streetwear Fit / Unisex',
        fabric: '50% Preshrunk Cotton / 50% Polyester',
        weight: '271 GSM / 8.0 oz/yd²',
        features: 'Double-needle stitching at waistband and cuffs, pouch pocket, matching drawstring',
        printMethod: 'Precision DTG Direct-to-Garment'
      }),
      careInstructions: 'Machine wash cold with like colours. Tumble dry medium. Cool iron if needed, avoid graphic area.',
      images: JSON.stringify([
        '/products/airfoil-hoodie.svg',
        '/products/airfoil-detail.svg'
      ]),
      basePrice: 2999.00,
      currency: 'INR',
      isPublished: true,
      isFeatured: true,
      printifyProductId: 'pf_prod_airfoil_02',
      printifyBlueprintId: 94, // Gildan 18500
      printifyProviderId: 29,
      variants: [
        { size: 'S', color: 'Charcoal Heather', colorHex: '#2A2D34', price: 2999, costPrice: 1750, printifyVariantId: 94001 },
        { size: 'M', color: 'Charcoal Heather', colorHex: '#2A2D34', price: 2999, costPrice: 1750, printifyVariantId: 94002 },
        { size: 'L', color: 'Charcoal Heather', colorHex: '#2A2D34', price: 2999, costPrice: 1750, printifyVariantId: 94003 },
        { size: 'XL', color: 'Charcoal Heather', colorHex: '#2A2D34', price: 2999, costPrice: 1750, printifyVariantId: 94004 },
        { size: '2XL', color: 'Charcoal Heather', colorHex: '#2A2D34', price: 3199, costPrice: 1890, printifyVariantId: 94005 },
        { size: 'M', color: 'Jet Black', colorHex: '#0F1115', price: 2999, costPrice: 1750, printifyVariantId: 94012 },
        { size: 'L', color: 'Jet Black', colorHex: '#0F1115', price: 2999, costPrice: 1750, printifyVariantId: 94013 },
      ]
    },
    {
      slug: 'four-forces-flight-tee',
      title: 'The Principle: Vector Equilibrium T-Shirt',
      subtitle: 'Lift, Weight, Thrust, Drag dynamic equilibrium model',
      description: 'A pure minimalist visual study in aerospace equilibrium: L = W and T = D in unaccelerated steady-state level flight. Technical vectors accented in high-visibility cockpit amber with coordinate axis annotations.',
      category: 'principle',
      specifications: JSON.stringify({
        cut: 'Retail Fit / Unisex',
        fabric: '100% Airlume Combed and Ring-Spun Cotton',
        weight: '142 GSM / 4.2 oz/yd²',
        features: 'Crew neck, side-seamed, tear-away label',
        printMethod: 'High-density DTG'
      }),
      careInstructions: 'Machine wash warm, inside out, tumble dry low.',
      images: JSON.stringify([
        '/products/forces-black.svg',
        '/products/forces-detail.svg'
      ]),
      basePrice: 1499.00,
      currency: 'INR',
      isPublished: true,
      isFeatured: true,
      printifyProductId: 'pf_prod_forces_03',
      printifyBlueprintId: 12,
      printifyProviderId: 29,
      variants: [
        { size: 'S', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12101 },
        { size: 'M', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12102 },
        { size: 'L', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12103 },
        { size: 'XL', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12104 },
        { size: '2XL', color: 'Pitch Black', colorHex: '#0D1117', price: 1599, costPrice: 920, printifyVariantId: 12105 },
      ]
    },
    {
      slug: 'mach-shock-cone-tee',
      title: 'Mach Angle & Prandt-Meyer Expansion T-Shirt',
      subtitle: 'Supersonic compressible gas dynamics & shockwave geometry',
      description: 'Supersonic aerodynamics encapsulated: sin(μ) = 1/M. Illustrates the Mach cone angle μ at Mach 2.2 with expansion fan gradients, characteristic lines, and pressure ratio isotherms.',
      category: 'principle',
      specifications: JSON.stringify({
        cut: 'Retail Fit / Unisex',
        fabric: '100% Airlume Combed Cotton',
        weight: '142 GSM',
        features: 'Reinforced collar, pre-shrunk',
        printMethod: 'DTG Print'
      }),
      careInstructions: 'Inside out wash cold. Do not bleach. Tumble dry gentle.',
      images: JSON.stringify([
        '/products/mach-black.svg'
      ]),
      basePrice: 1599.00,
      currency: 'INR',
      isPublished: true,
      isFeatured: false,
      printifyProductId: 'pf_prod_mach_04',
      printifyBlueprintId: 12,
      printifyProviderId: 29,
      variants: [
        { size: 'S', color: 'Pitch Black', colorHex: '#0D1117', price: 1599, costPrice: 870, printifyVariantId: 12201 },
        { size: 'M', color: 'Pitch Black', colorHex: '#0D1117', price: 1599, costPrice: 870, printifyVariantId: 12202 },
        { size: 'L', color: 'Pitch Black', colorHex: '#0D1117', price: 1599, costPrice: 870, printifyVariantId: 12203 },
        { size: 'XL', color: 'Pitch Black', colorHex: '#0D1117', price: 1599, costPrice: 870, printifyVariantId: 12204 },
      ]
    },
    {
      slug: 'navier-stokes-hoodie',
      title: 'Navier-Stokes: May Contain Turbulence Heavy Hoodie',
      subtitle: 'Non-linear partial differential equations of fluid motion',
      description: 'Because real fluids have viscosity. Featuring the full incompressible 3D Navier-Stokes momentum equations with Reynolds stress tensor footnotes. Warning label: "Existence and smoothness not guaranteed."',
      category: 'culture',
      specifications: JSON.stringify({
        cut: 'Heavyweight Boxy Fit',
        fabric: '50% Cotton / 50% Poly fleece',
        weight: '271 GSM / 8.0 oz',
        features: 'Thermal fleece inner, metal grommets, pouch pocket',
        printMethod: 'DTG with white underbase'
      }),
      careInstructions: 'Cold wash, wash inside out. Air dry recommended to preserve print crispness.',
      images: JSON.stringify([
        '/products/navier-hoodie.svg'
      ]),
      basePrice: 3199.00,
      currency: 'INR',
      isPublished: true,
      isFeatured: true,
      printifyProductId: 'pf_prod_navier_05',
      printifyBlueprintId: 94,
      printifyProviderId: 29,
      variants: [
        { size: 'S', color: 'Jet Black', colorHex: '#0F1115', price: 3199, costPrice: 1800, printifyVariantId: 94101 },
        { size: 'M', color: 'Jet Black', colorHex: '#0F1115', price: 3199, costPrice: 1800, printifyVariantId: 94102 },
        { size: 'L', color: 'Jet Black', colorHex: '#0F1115', price: 3199, costPrice: 1800, printifyVariantId: 94103 },
        { size: 'XL', color: 'Jet Black', colorHex: '#0F1115', price: 3199, costPrice: 1800, printifyVariantId: 94104 },
      ]
    },
    {
      slug: 'bernoulli-equation-tee',
      title: 'In Bernoulli We Trust T-Shirt',
      subtitle: 'Static pressure vs dynamic pressure differential',
      description: 'A classic homage to fluid mechanics: P + 0.5*ρ*v^2 + ρ*g*h = constant. Venturi tube illustration with pressure tap manometer tubes and streamline convergence.',
      category: 'culture',
      specifications: JSON.stringify({
        cut: 'Classic Fitted Crew / Unisex',
        fabric: '100% Ring-Spun Cotton',
        weight: '142 GSM',
        features: 'Shoulder taping, preshrunk',
        printMethod: 'DTG'
      }),
      careInstructions: 'Machine wash warm, tumble dry low.',
      images: JSON.stringify([
        '/products/bernoulli-black.svg'
      ]),
      basePrice: 1499.00,
      currency: 'INR',
      isPublished: true,
      isFeatured: false,
      printifyProductId: 'pf_prod_bernoulli_06',
      printifyBlueprintId: 12,
      printifyProviderId: 29,
      variants: [
        { size: 'S', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12301 },
        { size: 'M', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12302 },
        { size: 'L', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12303 },
        { size: 'XL', color: 'Pitch Black', colorHex: '#0D1117', price: 1499, costPrice: 850, printifyVariantId: 12304 },
      ]
    }
  ];

  for (const p of productsData) {
    const { variants, ...prodInfo } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...prodInfo,
        lastSyncedAt: new Date(),
        variants: {
          create: variants.map(v => ({
            title: `${v.size} / ${v.color}`,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            sku: `AM-${prodInfo.slug.toUpperCase().slice(0, 4)}-${v.size}-${v.color.toUpperCase().slice(0, 3)}`,
            price: v.price,
            costPrice: v.costPrice,
            isAvailable: true,
            printifyVariantId: v.printifyVariantId,
          }))
        }
      }
    });
    console.log(`Created product: ${createdProduct.title} (${createdProduct.slug})`);
  }

  console.log('Aeromach catalog seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
