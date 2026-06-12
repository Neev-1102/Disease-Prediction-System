const diseaseInfo = {
  "Fungal infection": {
    description: "A fungal infection affecting skin, nails, or other body tissues.",
    doctor: "Dermatologist",
    precautions: [
      "Keep skin dry",
      "Maintain hygiene",
      "Avoid sharing towels",
      "Use antifungal medication"
    ]
  },

  "Allergy": {
    description: "An immune system reaction to a foreign substance.",
    doctor: "Allergist",
    precautions: [
      "Avoid allergens",
      "Keep surroundings clean",
      "Take prescribed medicines",
      "Consult doctor if symptoms worsen"
    ]
  },

  "GERD": {
    description: "Gastroesophageal reflux disease causes stomach acid to flow back into the food pipe.",
    doctor: "Gastroenterologist",
    precautions: [
      "Avoid spicy food",
      "Eat smaller meals",
      "Do not lie down after eating",
      "Maintain healthy weight"
    ]
  },

  "Chronic cholestasis": {
    description: "A condition where bile flow from the liver is reduced or blocked.",
    doctor: "Hepatologist",
    precautions: [
      "Avoid alcohol",
      "Follow prescribed diet",
      "Take medications regularly",
      "Monitor liver health"
    ]
  },

  "Drug Reaction": {
    description: "An unwanted response to a medication.",
    doctor: "General Physician",
    precautions: [
      "Stop suspected medicine",
      "Consult doctor immediately",
      "Avoid self-medication",
      "Keep allergy records"
    ]
  },

  "Peptic ulcer diseae": {
    description: "Open sores that develop on the inner lining of the stomach.",
    doctor: "Gastroenterologist",
    precautions: [
      "Avoid spicy foods",
      "Reduce stress",
      "Avoid smoking",
      "Take prescribed medication"
    ]
  },

  "AIDS": {
    description: "A chronic condition caused by HIV that weakens the immune system.",
    doctor: "Infectious Disease Specialist",
    precautions: [
      "Take ART medication",
      "Practice safe habits",
      "Maintain nutrition",
      "Regular medical checkups"
    ]
  },

  "Diabetes ": {
    description: "A disease that affects how the body uses blood sugar.",
    doctor: "Endocrinologist",
    precautions: [
      "Monitor blood sugar",
      "Exercise regularly",
      "Follow healthy diet",
      "Take medicines as prescribed"
    ]
  },

  "Hypertension ": {
    description: "Persistently high blood pressure.",
    doctor: "Cardiologist",
    precautions: [
      "Reduce salt intake",
      "Exercise regularly",
      "Manage stress",
      "Monitor blood pressure"
    ]
  },

  "Heart attack": {
    description: "A blockage of blood flow to the heart muscle.",
    doctor: "Cardiologist",
    precautions: [
      "Avoid smoking",
      "Maintain healthy diet",
      "Exercise regularly",
      "Take heart medications"
    ]
  },

  "Bronchial Asthma": {
    description: "A condition causing airways to narrow and swell.",
    doctor: "Pulmonologist",
    precautions: [
      "Avoid triggers",
      "Use inhalers properly",
      "Avoid smoke exposure",
      "Regular checkups"
    ]
  },

  "Pneumonia": {
    description: "An infection that inflames air sacs in one or both lungs.",
    doctor: "Pulmonologist",
    precautions: [
      "Take medications",
      "Get enough rest",
      "Drink fluids",
      "Avoid smoking"
    ]
  },

  "Tuberculosis": {
    description: "A bacterial infection that mainly affects the lungs.",
    doctor: "Pulmonologist",
    precautions: [
      "Complete medication course",
      "Wear mask if advised",
      "Maintain nutrition",
      "Regular follow-ups"
    ]
  },

  "Malaria": {
    description: "A mosquito-borne disease caused by parasites.",
    doctor: "General Physician",
    precautions: [
      "Use mosquito protection",
      "Take prescribed medicines",
      "Stay hydrated",
      "Rest adequately"
    ]
  },

  "Dengue": {
    description: "A mosquito-borne viral infection causing high fever.",
    doctor: "General Physician",
    precautions: [
      "Drink plenty of fluids",
      "Monitor platelet count",
      "Avoid dehydration",
      "Take adequate rest"
    ]
  },

  "Typhoid": {
    description: "A bacterial infection spread through contaminated food and water.",
    doctor: "General Physician",
    precautions: [
      "Drink clean water",
      "Maintain hygiene",
      "Take antibiotics as prescribed",
      "Eat light food"
    ]
  },

  "Migraine": {
    description: "A neurological condition causing severe headaches.",
    doctor: "Neurologist",
    precautions: [
      "Avoid stress",
      "Get proper sleep",
      "Stay hydrated",
      "Avoid trigger foods"
    ]
  },

  "Acne": {
    description: "A skin condition causing pimples and clogged pores.",
    doctor: "Dermatologist",
    precautions: [
      "Wash face regularly",
      "Avoid oily products",
      "Stay hydrated",
      "Use prescribed creams"
    ]
  },

  "Psoriasis": {
    description: "A chronic skin disease causing red, scaly patches.",
    doctor: "Dermatologist",
    precautions: [
      "Moisturize skin",
      "Avoid skin injuries",
      "Manage stress",
      "Follow treatment plan"
    ]
  },

  "Chicken pox": {
    description: "A highly contagious viral infection causing itchy rash.",
    doctor: "General Physician",
    precautions: [
      "Avoid scratching",
      "Get enough rest",
      "Stay hydrated",
      "Avoid contact with others"
    ]
  },

  "(vertigo) Paroymsal Positional Vertigo": {
  description: "A condition causing dizziness and spinning sensation due to head movement.",
  doctor: "ENT Specialist",
  precautions: [
    "Avoid sudden movements",
    "Sleep properly",
    "Stay hydrated",
    "Follow treatment"
  ]
},

"Alcoholic hepatitis": {
  description: "Inflammation of the liver caused by excessive alcohol use.",
  doctor: "Hepatologist",
  precautions: [
    "Avoid alcohol",
    "Eat nutritious food",
    "Stay hydrated",
    "Regular checkups"
  ]
},

"Arthritis": {
  description: "Inflammation of joints causing pain and stiffness.",
  doctor: "Rheumatologist",
  precautions: [
    "Exercise regularly",
    "Maintain healthy weight",
    "Protect joints",
    "Follow medications"
  ]
},

"Cervical spondylosis": {
  description: "Age-related wear and tear affecting neck bones.",
  doctor: "Orthopedic Doctor",
  precautions: [
    "Maintain posture",
    "Exercise carefully",
    "Avoid heavy lifting",
    "Stretch regularly"
  ]
},

"Common Cold": {
  description: "A viral infection affecting nose and throat.",
  doctor: "General Physician",
  precautions: [
    "Drink warm fluids",
    "Take rest",
    "Maintain hygiene",
    "Eat healthy food"
  ]
},

"Gastroenteritis": {
  description: "Inflammation of stomach and intestines causing diarrhea.",
  doctor: "General Physician",
  precautions: [
    "Drink ORS",
    "Stay hydrated",
    "Eat light meals",
    "Take rest"
  ]
},

"Hepatitis A": {
  description: "A viral infection affecting liver function.",
  doctor: "Hepatologist",
  precautions: [
    "Drink clean water",
    "Avoid alcohol",
    "Eat healthy food",
    "Take rest"
  ]
},

"Hepatitis B": {
  description: "A viral infection that can damage the liver.",
  doctor: "Hepatologist",
  precautions: [
    "Take prescribed medicines",
    "Avoid alcohol",
    "Regular testing",
    "Healthy diet"
  ]
},

"Hepatitis C": {
  description: "A liver infection caused by hepatitis C virus.",
  doctor: "Hepatologist",
  precautions: [
    "Take medicines",
    "Avoid alcohol",
    "Eat healthy meals",
    "Attend follow-up visits"
  ]
},

"Hepatitis D": {
  description: "A liver disease occurring with hepatitis B infection.",
  doctor: "Hepatologist",
  precautions: [
    "Medical monitoring",
    "Healthy eating",
    "Rest properly",
    "Avoid alcohol"
  ]
},

"Hepatitis E": {
  description: "A liver infection commonly spread through contaminated water.",
  doctor: "Hepatologist",
  precautions: [
    "Drink clean water",
    "Eat hygienic food",
    "Take rest",
    "Stay hydrated"
  ]
},

"Hyperthyroidism": {
  description: "Condition where thyroid gland becomes overactive.",
  doctor: "Endocrinologist",
  precautions: [
    "Take medications",
    "Monitor thyroid",
    "Eat balanced diet",
    "Exercise moderately"
  ]
},

"Hypoglycemia": {
  description: "Condition where blood sugar becomes too low.",
  doctor: "Endocrinologist",
  precautions: [
    "Eat meals on time",
    "Carry glucose",
    "Monitor sugar",
    "Avoid skipping meals"
  ]
},

"Hypothyroidism": {
  description: "Condition where thyroid gland becomes underactive.",
  doctor: "Endocrinologist",
  precautions: [
    "Take thyroid medicine",
    "Exercise regularly",
    "Maintain diet",
    "Monitor health"
  ]
},

"Impetigo": {
  description: "A contagious bacterial skin infection.",
  doctor: "Dermatologist",
  precautions: [
    "Keep skin clean",
    "Avoid scratching",
    "Wash hands",
    "Apply prescribed medicine"
  ]
},

"Jaundice": {
  description: "Yellowing of skin caused by liver-related conditions.",
  doctor: "Hepatologist",
  precautions: [
    "Stay hydrated",
    "Eat healthy food",
    "Take rest",
    "Avoid alcohol"
  ]
},

"Osteoarthristis": {
  description: "Joint disease causing pain and reduced flexibility.",
  doctor: "Orthopedic Doctor",
  precautions: [
    "Exercise gently",
    "Maintain healthy weight",
    "Protect joints",
    "Follow treatment"
  ]
},

"Paralysis (brain hemorrhage)": {
  description: "Loss of muscle function due to bleeding in the brain.",
  doctor: "Neurologist",
  precautions: [
    "Immediate medical care",
    "Attend rehabilitation",
    "Exercise carefully",
    "Monitor recovery"
  ]
},

"Urinary tract infection": {
  description: "Infection affecting urinary organs.",
  doctor: "Urologist",
  precautions: [
    "Drink more water",
    "Maintain hygiene",
    "Avoid holding urine",
    "Take medicines"
  ]
},

"Varicose veins": {
  description: "Enlarged veins commonly appearing in legs.",
  doctor: "Vascular Specialist",
  precautions: [
    "Exercise regularly",
    "Elevate legs",
    "Avoid standing long",
    "Maintain healthy weight"
  ]
},

"Dimorphic hemmorhoids(piles)": {
  description: "Swollen veins in lower rectum causing pain and discomfort.",
  doctor: "Proctologist",
  precautions: [
    "Eat fiber-rich food",
    "Drink water",
    "Avoid straining",
    "Exercise regularly"
  ]
},
  
};

export default diseaseInfo;