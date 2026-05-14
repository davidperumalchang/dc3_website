/* =========================================================
   Destiny C3 — Locations Data
   - Source of truth for the locations explorer on locations.html
   - Add / edit churches here. The page renders from this object.
   - serviceTimes: [] will display a graceful fallback in the UI.
   ========================================================= */
window.DC3_LOCATIONS = {
  order: ["malaysia", "india", "philippines", "thailand"],
  regions: {
    malaysia: {
      label: "Malaysia",
      tagline: "Where the Destiny C3 family began.",
      churches: [
        {
          name: "Destiny C3 Subang — Main Church",
          languages: ["English"],
          pastors: ["Clarance Sashi", "Deborah Clarance"],
          address:
            "S02-06, S02-07, S02-08, Impian Meridian, USJ 1, Jalan Subang 1, 47500 Subang Jaya",
          city: "Subang Jaya, Selangor",
          serviceTimes: ["Sundays · 10:30 AM"]
        },
        {
          name: "Destiny C3 Chinatown KL",
          languages: ["English"],
          pastors: ["Ramesh Kumar"],
          address:
            "Level 15, Kompleks Selangor, 51 Jalan Sultan, City Centre, 50000 Kuala Lumpur",
          city: "Kuala Lumpur",
          serviceTimes: []
        },
        {
          name: "Destiny C3 Shah Alam",
          languages: ["Tamil"],
          pastors: ["Dale Padman", "Naveen Neethan"],
          address: "24-1 Jalan Kristal AR7/AR, Seksyen 7, Shah Alam",
          city: "Shah Alam, Selangor",
          serviceTimes: []
        },
        {
          name: "Destiny C3 Bukit Beruntung",
          languages: ["Tamil"],
          pastors: ["Peter Kana"],
          address:
            "No 4, Jalan 1B/2, Sek BB4, Bandar Bukit Beruntung, 48300 Rawang, Selangor",
          city: "Bukit Beruntung / Rawang, Selangor",
          serviceTimes: []
        },
        {
          name: "Destiny C3 Kuala Lumpur (Filipino)",
          languages: ["Tagalog"],
          pastors: ["Roy Evangelio"],
          address:
            "Level 14, Kompleks Selangor, 51 Jalan Sultan, City Centre, 50000 Kuala Lumpur",
          city: "Kuala Lumpur",
          serviceTimes: []
        },
        {
          name: "Destiny C3 Bera",
          languages: ["Bahasa Malaysia"],
          pastors: ["Joham"],
          address:
            "No 11, Taman Meranti Jaya 1, 28200 Triang, Bera, Pahang",
          city: "Triang, Bera, Pahang",
          serviceTimes: []
        }
      ]
    },

    india: {
      label: "India",
      tagline: "Reaching India with the love of Jesus.",
      churches: [
        {
          name: "Destiny C3 Visthar",
          languages: ["English", "Hindi"],
          pastors: ["Day", "Jayamary"],
          address:
            "A Wing, 1st Floor, Ruah Complex, Doddagubi Main Road, Visthar, 560077",
          city: "Bangalore, Karnataka",
          serviceTimes: []
        },
        {
          name: "Destiny C3 Hyderabad",
          languages: ["English", "Telugu"],
          pastors: ["Joshua Pothuganti"],
          address:
            "58 Godhumakunta, Near IMA Campus, Medchal, Hyderabad, 501301",
          city: "Hyderabad, Telangana",
          serviceTimes: []
        }
      ]
    },

    philippines: {
      label: "Philippines",
      tagline: "Family across the islands.",
      churches: [
        {
          name: "Destiny C3 Catarman",
          languages: ["Tagalog"],
          pastors: ["Rey Vy"],
          address:
            "Purok 3, Jose Abadsantos, Catarman, Northern Samar, Philippines 6400",
          city: "Catarman, Northern Samar",
          serviceTimes: []
        }
      ]
    },

    thailand: {
      label: "Thailand",
      tagline: "Hope in the heart of Southeast Asia.",
      churches: [
        {
          name: "Destiny C3 Chiang Mai",
          languages: ["English"],
          pastors: ["Vincent Nimbalker"],
          address:
            "80/16 Soi 3A, Loi Kroh Road, Chang Khlan, Chiang Mai 50100",
          city: "Chiang Mai",
          serviceTimes: []
        }
      ]
    }
  }
};
