import * as dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Load env before importing db
dotenv.config({ path: path.join(__dirname, "../.env") });

async function seedTeam() {
  console.log("🚀 Enhancing team members with images and social data...");
  try {
    const dbModule = await import("../src/db/database");
    const db = dbModule.default || dbModule;

    // Clear existing pseudo members to avoid duplicates or stale data
    // We'll identify them by the 'team-' prefix we used or just clear all for a fresh start if acceptable
    // For safety, we'll just insert/update based on name

    const teamMembers = [
      {
        name: "Kwesi Appiah",
        role: "Senior Developer",
        bio: "Building the future of finance in Africa, one line of code at a time. Specializing in fintech solutions and system reliability.",
        image: "/images/team/kwesi.png",
        social: {
          twitter: "https://twitter.com/kwesiappiah",
          linkedin: "https://linkedin.com/in/kwesiappiah",
          github: "https://github.com/kwesiappiah",
        },
        order: 1,
      },
      {
        name: "Ama Serwaa",
        role: "UI/UX Lead",
        bio: "Design is not just what it looks like and feels like. Design is how it works. Dedicated to crafting seamless digital journeys.",
        image: "/images/team/ama.png",
        social: {
          twitter: "https://twitter.com/amaserwaa",
          linkedin: "https://linkedin.com/in/amaserwaa",
        },
        order: 2,
      },
      {
        name: "Kofi Mensah",
        role: "Cloud Architect",
        bio: "Scaling innovation across the continent. Leveraging cloud technologies to empower businesses and individuals alike.",
        image: "/images/team/kofi.png",
        social: {
          linkedin: "https://linkedin.com/in/kofimensah",
          github: "https://github.com/kofimensah",
        },
        order: 3,
      },
      {
        name: "Abena Osei",
        role: "Product Manager",
        bio: "Bridging the gap between technology and the user. Focused on delivering products that solve real-world problems.",
        image: "/images/team/abena.png",
        social: {
          twitter: "https://twitter.com/abenaosei",
          linkedin: "https://linkedin.com/in/abenaosei",
        },
        order: 4,
      },
      {
        name: "Yaw Boateng",
        role: "Security Analyst",
        bio: "Security is a process, not a product. Committed to protecting our digital ecosystem from emerging threats.",
        image: "/images/team/yaw.png",
        social: {
          twitter: "https://twitter.com/yawboateng",
          linkedin: "https://linkedin.com/in/yawboateng",
          github: "https://github.com/yawboateng",
        },
        order: 5,
      },
      {
        name: "Akosua Antwi",
        role: "Operations Head",
        bio: "Efficiency is the backbone of any successful organization. Ensuring our internal engine runs at peak performance.",
        image: "/images/team/akosua.png",
        social: { linkedin: "https://linkedin.com/in/akosuaantwi" },
        order: 6,
      },
      {
        name: "Ekow Mensah",
        role: "Lead DevOps",
        bio: "Automating excellence. Ensuring our deployment pipelines are as fast and reliable as our code.",
        image: "", // Placeholder for now
        social: {
          linkedin: "https://linkedin.com/in/ekowmensah",
          github: "https://github.com/ekowmensah",
        },
        order: 7,
      },
    ];

    // First, let's clear the table to ensure a clean state for this demo/pseudo setup
    // WARNING: Only do this if you are sure you want to reset the team table.
    await db.query("DELETE FROM team_members");
    console.log("🧹 Cleared existing team members.");

    for (const member of teamMembers) {
      const id = `team-${uuidv4().slice(0, 8)}`;

      await db.query(
        'INSERT INTO team_members (id, name, role, bio, image, social, "order") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          id,
          member.name,
          member.role,
          member.bio,
          member.image,
          JSON.stringify(member.social),
          member.order,
        ],
      );
      console.log(`✅ Seeded: ${member.name}`);
    }

    console.log("✨ Team seeding complete.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedTeam();
