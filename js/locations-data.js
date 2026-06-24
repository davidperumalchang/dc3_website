/* =========================================================
   Destiny C3 — Locations Data
   - Source of truth for the locations explorer on locations.html
   - Add / edit churches here. The page renders from this object.
   - serviceTimes: [] will display a graceful fallback in the UI.
   ========================================================= */
window.DC3_LOCATIONS = {
  order: ["malaysia", "india", "thailand", "cambodia"],
  regions: {
    malaysia: {
      label: "Malaysia",
      flag: "assets/img/country/my.svg",
      tagline: "Where the Destiny C3 family began.",
      churches: [
        {
          name: "Destiny C3 Subang Jaya - Main Church",
          languages: ["English"],
          pastors: ["Clarance Shashi", "Deborah Clarance"],
          photo: "assets/img/pastors/clarance_deb.png",
          address:
            "S02-06, S02-07 & S02-08, Impian Meridian, USJ 1, Jalan Subang 1, 47500 Subang Jaya",
          city: "Subang Jaya, Selangor",
          serviceTimes: ["Sundays · 10:30 AM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/destinyc3/"
          }
        },
        {
          name: "Destiny C3 Subang Jaya",
          languages: ["Tamil"],
          pastors: ["Dale Padman", "Gawri Padman"],
          photo: "assets/img/pastors/dale_gawri.png",
          address:
            "S02-06, S02-07 & S02-08, Impian Meridian, USJ 1, Jalan Subang 1, 47500 Subang Jaya",
          city: "Subang Jaya, Selangor",
          serviceTimes: ["Sundays · 5:00 PM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/destinyc3/"
          }
        },
        {
          name: "Destiny C3 Subang Jaya",
          languages: ["Urdu", "Hindi", "Punjabi"],
          pastors: ["Ayub Saroosh", "Aneeta Ayub"],
          photo: "assets/img/pastors/ayub_aneeta.png",
          address:
            "S02-06, S02-07 & S02-08, Impian Meridian, USJ 1, Jalan Subang 1, 47500 Subang Jaya",
          city: "Subang Jaya, Selangor",
          serviceTimes: ["Saturdays · 8:30 PM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/destinyc3.uhp"
          }
        },
        {
          name: "Destiny C3 Shah Alam",
          languages: ["Tamil"],
          pastors: ["Dale Padman", "Gawri Padman"],
          photo: "assets/img/pastors/dale_gawri.png",
          address:
            "24-1 (First Floor), Jalan Kristal AR7/AR, Seksyen 7, 40000 Shah Alam",
          city: "Shah Alam, Selangor",
          serviceTimes: ["Sundays · 10:30 AM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/destinyc3/"
          }
        },
        {
          name: "Destiny C3 Chinatown",
          languages: ["English"],
          pastors: ["Ramesh Kumar", "Serene Kumar"],
          photo: "assets/img/pastors/ramesh_serene.png",
          address:
            "Level 15, Kompleks Selangor, 51 Jalan Sultan, Lorong Petaling, 50000 Kuala Lumpur",
          city: "Kuala Lumpur",
          serviceTimes: ["Sundays · 9:30 AM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/destinyc3/"
          }
        },
        {
          name: "Destiny C3 Chinatown",
          languages: ["Tagalog"],
          pastors: ["Roy Evangelio", "Maria Roy"],
          photo: "assets/img/pastors/roy_maria.png",
          address:
            "Level 15, Kompleks Selangor, 51 Jalan Sultan, Lorong Petaling, 50000 Kuala Lumpur",
          city: "Kuala Lumpur",
          serviceTimes: ["Sundays · 11:30 AM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/destinyc3/"
          }
        },
        {
          name: "Destiny C3 Bera, Pahang (Orang Asli Ministry)",
          languages: ["Bahasa Malaysia"],
          pastors: ["Joham Ali", "Augustina Pongsendana"],
          photo: "assets/img/pastors/joham_augustina.png",
          address: "Sub Lot 39B KM 2, Jalan Triang, Bera, 28300 Pahang",
          city: "Bera, Pahang",
          serviceTimes: ["Sundays · 10:00 AM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/destinyc3/"
          }
        }
      ]
    },

    india: {
      label: "India",
      flag: "assets/img/country/in.svg",
      tagline: "Reaching India with the love of Jesus.",
      note: "Destiny C3 India has multiple locations. The main contact is Pastor Bharat Kanapathy & Jayamalar Anthony.",
      churches: [
        {
          name: "Destiny C3 India",
          languages: ["English"],
          pastors: ["Bharat Kanapathy", "Jayamalar Anthony"],
          photo: "assets/img/pastors/bharat_jeyamalar.png",
          address:
            "A Wing, 1st Floor, Ruah Complex, Doddagubi Main Road, Bangalore 560077, Karnataka",
          city: "Bangalore, Karnataka",
          serviceTimes: [],
          socials: {
            facebook: "https://www.facebook.com/destinyc3india",
            instagram: "https://www.instagram.com/destinyc3india"
          }
        }
      ]
    },

    thailand: {
      label: "Thailand",
      flag: "assets/img/country/th.svg",
      tagline: "Hope in the heart of Southeast Asia.",
      churches: [
        {
          name: "Destiny C3 Chiang Mai",
          languages: ["English"],
          pastors: ["Vincent Nimbalker", "Helen Avadiar-Nimbalker"],
          photo: "assets/img/pastors/helen_vincent.png",
          address:
            "4/2 Loi Kroh Rd Lane 3, Chang Khlan, Chiang Mai 50100",
          city: "Chiang Mai",
          serviceTimes: ["Fridays · 10:00 AM"],
          socials: {
            facebook: "https://www.facebook.com/destinyc3church/",
            instagram: "https://www.instagram.com/dc3_chiangmai"
          }
        }
      ]
    },

    cambodia: {
      label: "Cambodia",
      flag: "assets/img/country/kh.svg",
      tagline: "New family across the Mekong.",
      churches: [
        {
          name: "Destiny C3 Bykota",
          languages: ["Khmer"],
          pastors: [
            "Keziah Praise T. Matiga",
            "Keren Joy O. Matiga",
            "Levi P. Matiga"
          ],
          photo: "assets/img/pastors/levi_gang.png",
          address:
            "Borey Thy Thy, Poipet City, Banteay Meanchey, Cambodia",
          city: "Poipet, Banteay Meanchey",
          serviceTimes: ["Saturdays · 7:30 PM"],
          socials: {
            facebook: "https://web.facebook.com/destinyc3bykotapoipet",
            instagram: "https://www.instagram.com/c3bykota_poipet"
          }
        }
      ]
    }
  }
};
