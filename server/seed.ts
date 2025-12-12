import { db } from "./db";
import { 
  tenants, 
  tenantSettings, 
  tenantMembers,
  users, 
  events,
  forumCategories,
  posts
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create default tenant: Akıncılar
    console.log("Creating default tenant...");
    const [tenant] = await db.insert(tenants).values({
      name: "Akıncılar Gençlik Topluluğu",
      slug: "akincilar",
      plan: "pro",
      status: "active",
    }).returning();

    console.log(`✅ Created tenant: ${tenant.name}`);

    // Create tenant settings
    await db.insert(tenantSettings).values({
      tenantId: tenant.id,
      siteTitle: "AKINCILAR - Gençlik Hareketi",
      heroTitle: "GELECEĞİ ŞEKILLENDIR",
      heroSubtitle: "Genç, dinamik ve vizyon sahibi bir topluluk olarak hayallerini gerçeğe dönüştür.",
      contactEmail: "info@akincilar.org",
      socials: {
        twitter: "https://twitter.com/akincilar",
        instagram: "https://instagram.com/akincilar",
        facebook: "https://facebook.com/akincilar"
      },
      defaultLanguage: "tr",
    });

    console.log("✅ Created tenant settings");

    // Create admin user
    console.log("Creating admin user...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      displayName: "Admin",
      email: "admin@akincilar.org",
      passwordHash,
      role: "superadmin",
      status: "active",
      trustLevel: 5,
      reputationPoints: 1000,
      emailVerified: true,
      bio: "Platform yöneticisi",
    }).returning();

    console.log(`✅ Created admin user: ${adminUser.username}`);

    // Add admin to tenant
    await db.insert(tenantMembers).values({
      tenantId: tenant.id,
      userId: adminUser.id,
      role: "owner",
    });

    console.log("✅ Added admin to tenant");

    // Create forum categories
    console.log("Creating forum categories...");
    const categories = [
      {
        tenantId: tenant.id,
        name: "Genel Tartışma",
        slug: "genel",
        description: "Genel konular ve sohbet için alan",
        isLocked: false,
      },
      {
        tenantId: tenant.id,
        name: "Duyurular",
        slug: "duyurular",
        description: "Resmi duyurular ve haberler",
        isLocked: false,
      },
      {
        tenantId: tenant.id,
        name: "Projeler",
        slug: "projeler",
        description: "Topluluk projeleri ve girişimler",
        isLocked: false,
      },
      {
        tenantId: tenant.id,
        name: "Etkinlikler",
        slug: "etkinlikler",
        description: "Etkinlik planlaması ve tartışmaları",
        isLocked: false,
      },
      {
        tenantId: tenant.id,
        name: "Yardım & Destek",
        slug: "yardim",
        description: "Sorular ve yardım talepleri",
        isLocked: false,
      }
    ];

    await db.insert(forumCategories).values(categories);
    console.log(`✅ Created ${categories.length} forum categories`);

    // Create sample events
    console.log("Creating sample events...");
    const sampleEvents = [
      {
        tenantId: tenant.id,
        title: "Hoşgeldin Toplantısı",
        category: "Sosyal",
        description: "Yeni üyelerin topluluğumuzla tanışması için düzenlenen hoşgeldin etkinliği. Çay, sohbet ve yeni arkadaşlıklar seni bekliyor!",
        location: "Merkez Bina - Toplantı Salonu",
        eventDate: new Date("2025-12-20T18:00:00"),
        capacity: 50,
      },
      {
        tenantId: tenant.id,
        title: "Teknoloji ve Gelecek Semineri",
        category: "Eğitim",
        description: "Yapay zeka, blockchain ve geleceğin teknolojileri üzerine uzman konuşmacılarla interaktif seminer.",
        location: "Üniversite Konferans Salonu",
        eventDate: new Date("2025-12-25T14:00:00"),
        capacity: 100,
      },
      {
        tenantId: tenant.id,
        title: "Kış Kampı 2025",
        category: "Kamp",
        description: "3 günlük kış kampımızda doğayla iç içe aktiviteler, atölye çalışmaları ve eğlence dolu anlar!",
        location: "Kartepe Dağ Evi",
        eventDate: new Date("2026-01-10T09:00:00"),
        capacity: 30,
      },
      {
        tenantId: tenant.id,
        title: "Girişimcilik Zirvesi",
        category: "Eğitim",
        description: "Başarılı girişimcilerle networking fırsatı ve startup ekosistemi hakkında bilgilendirme.",
        location: "İş Merkezi - A Blok",
        eventDate: new Date("2026-01-15T10:00:00"),
        capacity: 80,
      },
      {
        tenantId: tenant.id,
        title: "Spor Günü",
        category: "Spor",
        description: "Futbol, basketbol ve voleybol turnuvaları. Kazanan takımlar ödüllendirilecek!",
        location: "Spor Kompleksi",
        eventDate: new Date("2026-01-22T13:00:00"),
        capacity: 60,
      }
    ];

    await db.insert(events).values(sampleEvents);
    console.log(`✅ Created ${sampleEvents.length} sample events`);

    // Create sample blog posts
    console.log("Creating sample blog posts...");
    const samplePosts = [
      {
        tenantId: tenant.id,
        authorId: adminUser.id,
        title: "Topluluğumuza Hoşgeldiniz!",
        slug: "hosgeldiniz",
        excerpt: "Akıncılar topluluğunun kuruluş hikayesi ve vizyonumuz.",
        content: `
# Akıncılar'a Hoşgeldiniz!

Merhaba değerli gençler!

Akıncılar topluluğu olarak sizleri aramızda görmekten büyük mutluluk duyuyoruz. Biz, geleceğe şekil vermek isteyen, hayallerini gerçeğe dönüştürmek için çalışan genç ve dinamik bir topluluğuz.

## Vizyonumuz

Gençlerin potansiyellerini keşfetmelerine ve geliştirmelerine yardımcı olmak, toplumsal dönüşüme katkıda bulunmak ve birlikte daha güçlü olmak.

## Neler Yapıyoruz?

- Eğitim seminerleri ve workshoplar
- Sosyal sorumluluk projeleri
- Teknoloji ve inovasyon girişimleri
- Kültürel etkinlikler ve kamplar
- Girişimcilik ve kariyer destek programları

Haydi, sen de aramıza katıl ve fark yaratmaya başla!
        `,
        coverImage: null,
        status: "published",
        publishedAt: new Date(),
        seoTitle: "Akıncılar Gençlik Topluluğu - Hoşgeldiniz",
        seoDescription: "Geleceği birlikte şekillendirelim. Genç, dinamik ve vizyon sahibi topluluğumuz hakkında bilgi edinin.",
      },
      {
        tenantId: tenant.id,
        authorId: adminUser.id,
        title: "2025 Hedeflerimiz",
        slug: "2025-hedeflerimiz",
        excerpt: "Yeni yılda gerçekleştirmeyi planladığımız projeler ve etkinlikler.",
        content: `
# 2025 Yılı Hedeflerimiz

2025 yılında topluluğumuz için büyük hedefler koyduk!

## Projeler

1. **Dijital Okuryazarlık Projesi** - Dezavantajlı bölgelerdeki gençlere teknoloji eğitimi
2. **Yeşil Gelecek** - Çevre bilinci ve sürdürülebilirlik projeleri
3. **Startup İnkübatörü** - Genç girişimcilere mentorluk ve destek

## Etkinlikler

- Aylık eğitim seminerleri
- Çeyrek yıllık büyük kamplar
- Haftalık atölye çalışmaları
- Networking etkinlikleri

Hepinizi bu heyecan verici yolculuğa davet ediyoruz!
        `,
        coverImage: null,
        status: "published",
        publishedAt: new Date(),
        seoTitle: "2025 Hedeflerimiz - Akıncılar",
        seoDescription: "Akıncılar topluluğunun 2025 yılı projeleri, etkinlikleri ve hedefleri hakkında detaylı bilgi.",
      }
    ];

    await db.insert(posts).values(samplePosts);
    console.log(`✅ Created ${samplePosts.length} sample blog posts`);

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Tenant: ${tenant.name} (slug: ${tenant.slug})`);
    console.log(`   - Admin user: ${adminUser.username} / admin123`);
    console.log(`   - Forum categories: ${categories.length}`);
    console.log(`   - Sample events: ${sampleEvents.length}`);
    console.log(`   - Sample posts: ${samplePosts.length}`);
    console.log("\n✨ You can now login with username: admin, password: admin123");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
