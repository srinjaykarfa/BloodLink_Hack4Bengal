import { type NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://bytebusterscode:iYkzQsICVopcDUML@cluster0.3zzubin.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const DB_NAME = process.env.MONGO_DB_NAME || "VeinChain";

// Blood compatibility rules
const BLOOD_COMPATIBILITY_RULES = {
  "O-": {
    can_donate_to: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    can_receive_from: ["O-"],
  },
  "O+": {
    can_donate_to: ["O+", "A+", "B+", "AB+"],
    can_receive_from: ["O+", "O-"],
  },
  "A-": {
    can_donate_to: ["A-", "A+", "AB-", "AB+"],
    can_receive_from: ["A-", "O-"],
  },
  "A+": {
    can_donate_to: ["A+", "AB+"],
    can_receive_from: ["A+", "A-", "O+", "O-"],
  },
  "B-": {
    can_donate_to: ["B-", "B+", "AB-", "AB+"],
    can_receive_from: ["B-", "O-"],
  },
  "B+": {
    can_donate_to: ["B+", "AB+"],
    can_receive_from: ["B+", "B-", "O+", "O-"],
  },
  "AB-": {
    can_donate_to: ["AB-", "AB+"],
    can_receive_from: ["AB-", "A-", "B-", "O-"],
  },
  "AB+": {
    can_donate_to: ["AB+"],
    can_receive_from: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
  },
};

const ALL_BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

enum QueryType {
  DONOR_SEARCH = "DONOR_SEARCH",
  CAN_DONATE = "CAN_DONATE",
  CAN_RECEIVE = "CAN_RECEIVE",
  INVALID = "INVALID",
}

async function findDonorsFromExistingDB(bloodType: string, city: string) {
  const client = new MongoClient(MONGO_URI);
  let exactMatchFound = false;

  try {
    console.log("🔗 Connecting to database:", DB_NAME);
    await client.connect();
    const db = client.db(DB_NAME);

    // Get all collections to find the right one
    const collections = await db.listCollections().toArray();
    console.log(
      "📋 Available collections:",
      collections.map((c) => c.name)
    );

    // Try different collection names
    const possibleCollections = [
      "users",
      "donors",
      "user",
      "donor",
      "people",
      "accounts",
      ...collections.map((c) => c.name),
    ];

    let donors: any[] = [];
    let collectionUsed = null;

    for (const collectionName of possibleCollections) {
      try {
        const collection = db.collection(collectionName);
        const totalDocs = await collection.countDocuments({});

        if (totalDocs === 0) continue;

        console.log(
          `📊 Checking collection '${collectionName}' with ${totalDocs} documents`
        );

        // Get a sample document to understand structure
        const sampleDoc = await collection.findOne({});
        console.log(
          `📋 Sample document from ${collectionName}:`,
          JSON.stringify(sampleDoc, null, 2)
        );

        // Try different query patterns based on the sample document
        const possibleQueries = [];

        // Build queries based on what fields exist in the sample
        if (sampleDoc) {
          const fields = Object.keys(sampleDoc);
          console.log(`🔍 Available fields in ${collectionName}:`, fields);

          // Blood type queries
          if (fields.includes("bloodType")) {
            possibleQueries.push({ bloodType: bloodType });
            possibleQueries.push({
              bloodType: { $regex: `^${bloodType}$`, $options: "i" },
            });
          }
          if (fields.includes("blood")) {
            possibleQueries.push({ blood: bloodType });
            possibleQueries.push({
              blood: { $regex: `^${bloodType}$`, $options: "i" },
            });
          }
          if (fields.includes("bloodGroup")) {
            possibleQueries.push({ bloodGroup: bloodType });
            possibleQueries.push({
              bloodGroup: { $regex: `^${bloodType}$`, $options: "i" },
            });
          }

          // Add user type filters if they exist
          if (fields.includes("userType")) {
            possibleQueries.push({ userType: "donor", bloodType: bloodType });
            possibleQueries.push({ userType: "donor", blood: bloodType });
          }
          if (fields.includes("role")) {
            possibleQueries.push({ role: "donor", bloodType: bloodType });
            possibleQueries.push({ role: "donor", blood: bloodType });
          }
          if (fields.includes("type")) {
            possibleQueries.push({ type: "donor", bloodType: bloodType });
            possibleQueries.push({ type: "donor", blood: bloodType });
          }
        }

        // If no specific queries, try generic ones
        if (possibleQueries.length === 0) {
          possibleQueries.push({ bloodType: bloodType });
          possibleQueries.push({ blood: bloodType });
          possibleQueries.push({ bloodGroup: bloodType });
        }

        // Try each query
        for (const query of possibleQueries) {
          console.log(
            `🔍 Trying query in ${collectionName}:`,
            JSON.stringify(query)
          );
          const results = await collection.find(query).limit(10).toArray();
          console.log(`📊 Query results: ${results.length} documents found`);

          if (results.length > 0) {
            donors = results;
            collectionUsed = collectionName;
            console.log(
              `✅ Found ${results.length} donors in collection '${collectionName}'`
            );
            break;
          }
        }

        if (donors.length > 0) break;
      } catch (error) {
        console.log(
          `❌ Error checking collection ${collectionName}:`,
          error instanceof Error ? error.message : error
        );
        continue;
      }
    }

    if (donors.length === 0) {
      console.log("❌ No donors found in any collection");
      return { donors: [], exactMatchFound: false };
    }

    console.log(`✅ Using collection: ${collectionUsed}`);

    // Filter by city if specified
    if (city !== "Unknown" && donors.length > 0) {
      console.log(`🏙️ Filtering by city: ${city}`);

      const cityFilteredDonors = donors.filter((donor) => {
        const possibleCityFields = [
          donor.city,
          donor.address?.city,
          donor.location?.city,
          donor.personalInfo?.city,
          donor.profile?.city,
          donor.details?.city,
        ];

        return possibleCityFields.some(
          (cityField) =>
            cityField && cityField.toLowerCase().includes(city.toLowerCase())
        );
      });

      if (cityFilteredDonors.length > 0) {
        exactMatchFound = true;
        donors = cityFilteredDonors;
        console.log(`🎯 Found ${donors.length} donors in ${city}`);
      }
    }

    // Format the donor data
    const formattedDonors = donors.map((donor) => {
      const name =
        donor.name ||
        `${donor.firstName || ""} ${donor.lastName || ""}`.trim() ||
        donor.fullName ||
        donor.username ||
        "Unknown Name";

      const phone =
        donor.phone ||
        donor.phoneNumber ||
        donor.mobile ||
        donor.contact?.phone ||
        "Not provided";

      const email =
        donor.email ||
        donor.emailAddress ||
        donor.contact?.email ||
        "Not provided";

      const city =
        donor.city ||
        donor.address?.city ||
        donor.location?.city ||
        donor.personalInfo?.city ||
        donor.profile?.city ||
        "Unknown City";

      const bloodType =
        donor.bloodType || donor.blood || donor.bloodGroup || "Unknown";

      return {
        name,
        blood: bloodType,
        city,
        phone,
        email,
        totalDonations:
          donor.donorInfo?.totalDonations || donor.totalDonations || 0,
        lastDonation:
          donor.donorInfo?.lastDonationDate || donor.lastDonation || null,
      };
    });

    console.log("✅ Formatted donors:", formattedDonors.length);

    return {
      donors: formattedDonors,
      exactMatchFound,
    };
  } catch (error) {
    console.error("❌ Database error:", error);
    return { donors: [], exactMatchFound: false };
  } finally {
    await client.close();
  }
}

function extractInfo(text: string) {
  let bloodType: string | null = null;
  const textLower = text.toLowerCase();

  // Extract Blood Type
  const bloodMatches = text.match(/([ABOab]{1,2}[+-])/gi);
  if (bloodMatches) {
    for (const match of bloodMatches) {
      const normalized = match.toUpperCase();
      if (ALL_BLOOD_TYPES.includes(normalized)) {
        bloodType = normalized;
        break;
      }
    }
  }

  // Determine Query Type
  const donateKeywords = [
    "donate blood to",
    "can i donate",
    "give blood to",
    "donate to which groups",
    "groups can i donate to",
    "donate to",
  ];
  const receiveKeywords = [
    "receive blood from",
    "can i receive",
    "get blood from",
    "receive from which groups",
    "groups can donate to me",
    "receive from",
  ];

  const isDonateQuery = donateKeywords.some((keyword) =>
    textLower.includes(keyword)
  );
  const isReceiveQuery = receiveKeywords.some((keyword) =>
    textLower.includes(keyword)
  );

  if ((isDonateQuery || isReceiveQuery) && bloodType) {
    return {
      bloodType,
      city: "Unknown",
      queryType: isDonateQuery ? QueryType.CAN_DONATE : QueryType.CAN_RECEIVE,
    };
  } else if ((isDonateQuery || isReceiveQuery) && !bloodType) {
    return { bloodType: null, city: null, queryType: QueryType.INVALID };
  }

  // Extract city
  let city = "Unknown";
  const cityMatch = textLower.match(/\bin\s+([A-Za-z\s]+)/);
  if (cityMatch) {
    city = cityMatch[1]
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (!bloodType) {
    return { bloodType, city, queryType: QueryType.INVALID };
  }

  return { bloodType, city, queryType: QueryType.DONOR_SEARCH };
}

async function generateResponse(_query: string, queryData: any) {
  const { query_type, blood_type } = queryData;

  if (query_type === "INVALID") {
    return "I'm sorry, that query is outside my current scope. Please ask about finding blood donors (e.g., 'I need A+ in Kolkata') or blood compatibility (e.g., 'What blood types can O+ donate to?' or 'Which groups can donate blood to me if I am A-?').";
  }

  try {
    if (query_type === "CAN_DONATE") {
      const canDonate =
        queryData.can_donate_to?.join(", ") ||
        "No specific groups listed for donation compatibility.";
      return `Based on universal blood compatibility rules:\n\nIf you have **${blood_type}** blood, you can **donate blood to** the following blood types: **${canDonate}**.\n\nAlways consult with a medical professional for personalized advice.`;
    }

    if (query_type === "CAN_RECEIVE") {
      const canReceive =
        queryData.can_receive_from?.join(", ") ||
        "No specific groups listed for reception compatibility.";
      return `Based on universal blood compatibility rules:\n\nIf you have **${blood_type}** blood, you can **receive blood from** the following blood types: **${canReceive}**.\n\nAlways consult with a medical professional for personalized advice.`;
    }

    // Handle donor search
    const { donors, exact_match_found, city } = queryData;

    if (!donors || donors.length === 0) {
      return `I'm sorry, I couldn't find any available **${blood_type}** donors ${
        city !== "Unknown" ? `in ${city}` : ""
      } at the moment.\n\n**Debug Info:**\n• Database: VeinChain\n• Search query: ${blood_type} ${
        city !== "Unknown" ? `in ${city}` : ""
      }\n• Check /api/chatbot/debug for database structure\n\n**Suggestions:**\n• Verify donors are registered with correct blood type format\n• Check if database field is 'bloodType', 'blood', or 'bloodGroup'\n• Try searching without city name first`;
    }

    const donorList = donors
      .map((d: any) => {
        return `• **${d.name}** (${d.blood})\n  📍 ${d.city}\n  📞 ${d.phone}\n  📧 ${d.email}`;
      })
      .join("\n\n");

    let response = "";
    if (!exact_match_found && city !== "Unknown") {
      response += `I couldn't find exact matches for **${blood_type}** in **${city}**. However, here are available **${blood_type}** donors from other locations:\n\n`;
    } else if (exact_match_found) {
      response += `Great! I found **${donors.length}** available **${blood_type}** donor(s) in **${city}**:\n\n`;
    } else {
      response += `Here are **${donors.length}** available **${blood_type}** donor(s):\n\n`;
    }

    response += `**Available Donors:**\n${donorList}\n\n**Next Steps:**\n• Contact donors directly via phone or email\n• Be respectful and explain your urgent need clearly\n• Verify their current availability before visiting`;

    return response;
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm sorry, I'm currently unable to process your request due to a technical issue. Please try again in a moment.";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: "Query must be at least 3 characters long" },
      { status: 400 }
    );
  }

  try {
    const { bloodType, city, queryType } = extractInfo(query);

    const replyData: {
      query_type: string;
      blood_type: string | null;
      city: string;
      donors: any[];
      exact_match_found: boolean;
      can_donate_to: string[] | null;
      can_receive_from: string[] | null;
    } = {
      query_type: queryType,
      blood_type: bloodType,
      city: city || "Unknown",
      donors: [],
      exact_match_found: false,
      can_donate_to: null,
      can_receive_from: null,
    };

    if (queryType === QueryType.DONOR_SEARCH && bloodType) {
      const { donors, exactMatchFound } = await findDonorsFromExistingDB(
        bloodType,
        city
      );
      replyData.donors = donors;
      replyData.exact_match_found = exactMatchFound;
    } else if (
      (queryType === QueryType.CAN_DONATE ||
        queryType === QueryType.CAN_RECEIVE) &&
      bloodType
    ) {
      const compatibility =
        BLOOD_COMPATIBILITY_RULES[
          bloodType as keyof typeof BLOOD_COMPATIBILITY_RULES
        ];
      if (compatibility) {
        if (queryType === QueryType.CAN_DONATE) {
          replyData.can_donate_to = compatibility.can_donate_to;
        } else {
          replyData.can_receive_from = compatibility.can_receive_from;
        }
      } else {
        replyData.query_type = QueryType.INVALID;
      }
    }

    const reply = await generateResponse(query, replyData);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
